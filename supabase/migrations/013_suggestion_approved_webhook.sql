-- 013_suggestion_approved_webhook.sql
-- Fires the suggestion-approved-relay Edge Function whenever a suggestion row's
-- status transitions to 'approved'. This trigger gates only on the status
-- transition (see the WHEN clause below); it does not filter on kind or any
-- other column. The Edge Function (see
-- supabase/functions/suggestion-approved-relay/index.ts) re-checks kind and the
-- old status itself and decides all other relevance.
--
-- The relay URL is a project-specific literal (not a secret, so it's fine to
-- hardcode); the shared secret is read from Supabase Vault at call time,
-- NOT from `current_setting('app.settings.*')`. That pattern requires
-- `ALTER DATABASE ... SET`, which needs a superuser role the SQL Editor does
-- not have on hosted Supabase ("permission denied to set parameter"). Vault
-- is Supabase's documented replacement for exactly this case. Before running
-- this migration, store the secret once:
--   select vault.create_secret('<value>', 'suggestion_relay_secret', 'Shared secret for suggestion relay webhook');
-- and update v_relay_url below to this project's actual Edge Function URL.
--
-- IDEMPOTENT: safe to re-run (the vault secret is created separately, once,
-- and is not touched by re-running this file).

-- Enables the `vault` schema/functions (vault.create_secret, vault.decrypted_secrets)
-- used below to fetch the shared secret. No-op if already enabled.
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- The function that actually runs when the trigger below fires.
CREATE OR REPLACE FUNCTION public.notify_suggestion_approved()
RETURNS TRIGGER AS $$
DECLARE
  v_secret TEXT;
  -- Project-specific, not sensitive: safe to hardcode. Update if the project
  -- ref or function name ever changes.
  v_relay_url CONSTANT TEXT := 'https://yewcxcvngvdtsnigtmwd.supabase.co/functions/v1/suggestion-approved-relay';
BEGIN
  -- Look up the shared secret stored earlier via vault.create_secret(...).
  -- decrypted_secrets is a view that decrypts on read; the raw value is
  -- never stored in plaintext in the table itself.
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'suggestion_relay_secret';

  -- Fail loudly instead of silently calling the relay with a null/missing
  -- header, which the Edge Function would just reject as unauthorized with
  -- no clear signal as to why.
  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'suggestion_relay_secret not found in Vault; run vault.create_secret(...) first';
  END IF;

  -- Fire-and-forget: pg_net queues this HTTP POST and returns immediately;
  -- the actual request happens asynchronously in a background worker, after
  -- this trigger (and the UPDATE that fired it) has already committed. A
  -- failure here does NOT roll back the approval.
  PERFORM net.http_post(
    url := v_relay_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      -- Lets the Edge Function verify this call actually came from this
      -- trigger and not an arbitrary internet request to its public URL.
      'x-webhook-secret', v_secret
    ),
    body := jsonb_build_object(
      -- Shape matches what the Edge Function's WebhookPayload type expects:
      -- the full new row, and the full previous row (for the status-change
      -- check it does independently of this trigger's own WHEN clause).
      'record', to_jsonb(NEW),
      'old_record', to_jsonb(OLD)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   -- SECURITY DEFINER: runs with the function owner's privileges (not the
   -- caller's), so it can read vault.decrypted_secrets regardless of who/what
   -- triggered the UPDATE. search_path is pinned to an explicit allowlist
   -- (rather than relying on the caller's search_path) since every reference
   -- in the body above is already schema-qualified (vault.*, net.*). This
   -- is just defense-in-depth against search-path hijacking.
   SET search_path = public, pg_catalog, net, vault;

-- Replace any previous version of this trigger (safe to re-run this file).
DROP TRIGGER IF EXISTS notify_suggestion_approved ON public.suggestions;

-- Fires once per row, only on the specific transition that matters: status
-- becoming 'approved' when it wasn't already. Every other UPDATE on this
-- table (e.g. editing rationale, or re-approving an already-approved row)
-- does not invoke the function at all — Postgres evaluates the WHEN clause
-- before calling it, so this is cheaper than filtering inside the function.
CREATE TRIGGER notify_suggestion_approved
  AFTER UPDATE ON public.suggestions
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION public.notify_suggestion_approved();
