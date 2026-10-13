-- 012_suggestion_approved_webhook.sql
-- Fires the suggestion-approved-relay Edge Function whenever a suggestion row's
-- status transitions to 'approved'. This trigger gates only on the status
-- transition (see the WHEN clause below); it does not filter on kind or any
-- other column. The Edge Function (see
-- supabase/functions/suggestion-approved-relay/index.ts) re-checks kind and the
-- old status itself and decides all other relevance.
-- IDEMPOTENT: safe to re-run.

CREATE OR REPLACE FUNCTION public.notify_suggestion_approved()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.settings.suggestion_relay_url', true),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', current_setting('app.settings.suggestion_relay_secret', true)
    ),
    body := jsonb_build_object(
      'record', to_jsonb(NEW),
      'old_record', to_jsonb(OLD)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_catalog, net;

DROP TRIGGER IF EXISTS notify_suggestion_approved ON public.suggestions;
CREATE TRIGGER notify_suggestion_approved
  AFTER UPDATE ON public.suggestions
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION public.notify_suggestion_approved();
