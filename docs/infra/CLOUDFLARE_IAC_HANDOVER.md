# Handover: move aitoolreview.ai Cloudflare setup to infrastructure as code

Date: 2026-10-22. Written for a new Claude Code session. No secrets in this file.

## Goal

Everything below was configured by hand (cf CLI and dashboard) during the
GitHub Pages to Cloudflare Pages migration. Capture it in Terraform so it is
reviewable, reproducible and drift-checked. First milestone: `terraform plan`
shows **no changes** against the live account (import, do not recreate).

## Read first

- Branch `cloudflare-deploy` in `achisolomon/ai-tool-review`, PR #28.
  `.github/workflows/deploy.yml` explains the deploy model.
- Plan file: `~/.claude/plans/it-s-time-to-make-sorted-newell.md`.
- Pattern to copy: `/Users/achisolomon/Documents/Git-Achi-gmail/pushapp/Projects/infra`
  (README scope section, `envs/prod/{versions,backend,main,variables}.tf`,
  `docs/runbook-manual-steps.md`). Same layout, Cloudflare provider instead of Google.
- Cloudflare plugin skills are installed: `cloudflare:cf-cli`, `cloudflare:wrangler`.
  User rule: use the `cf` CLI for Cloudflare unless a Wrangler config exists.

## Deploy model (do not change while codifying)

- Cloudflare Pages builds the `production` branch via the Cloudflare GitHub app.
- GitHub Actions `deploy.yml` fast-forwards `production` to main only after the
  `Tests` workflow passes. No Cloudflare credentials live in GitHub.
- Every other branch builds a preview at `<branch>.aitoolreview-7pc.pages.dev`.
- `dev` branch is served at `dev.aitoolreview.ai`.
- Previews and dev are behind Cloudflare Access (Google login).
- `js/supabase-client.js`: localhost, `dev.aitoolreview.ai` and
  `*.aitoolreview-7pc.pages.dev` use the **dev** Supabase project; everything
  else uses **prod**.

## Inventory (live state to import)

Account `ed41b34a65186fab21acf05d371841ff`. Zone `aitoolreview.ai` =
`7575e3f6e72712e31e06abf7fd22c1d2`.

| Resource | Identity | Settings |
|---|---|---|
| Pages project | `aitoolreview` (subdomain `aitoolreview-7pc.pages.dev`, the random suffix is permanent) | GitHub source `achisolomon/ai-tool-review` (repo id 1236690173, owner id 35426030); production branch `production`; build `BUNDLE_WITHOUT=development:test JEKYLL_ENV=production bundle exec jekyll build`; output `_site`; preview deployments `all`; PR comments off |
| Pages custom domain | `dev.aitoolreview.ai` | active; serves the `dev` branch via the CNAME below |
| DNS CNAME | `dev` to `dev.aitoolreview-7pc.pages.dev` | proxied |
| Zone setting | `always_use_https` | `on` |
| Redirect ruleset | phase `http_request_dynamic_redirect`, id `898100349898433ca2f7705cc9262c31` | rule 1 "www.aitoolreview.ai": host www to `concat("https://aitoolreview.ai", path)`, 301, keep query. Rule 2 "index.html to / (SEO duplicate)": apex `/index.html` to `https://aitoolreview.ai/`, 301, keep query |
| Access app | `aitoolreview dev`, id `28b2e3b4-5e57-4a45-88a6-e742fe43f351` | self-hosted; destinations `dev.aitoolreview.ai` and `*.aitoolreview-7pc.pages.dev`; allowed IdP `7d158920-b0f2-47c7-804e-e3106cec3b5b` (Google, "Hearfy-Google", shared with Hearfy); auto-redirect to IdP; session 720h; hidden from App Launcher; inline allow policy "aitoolreview dev testers" include email `achisolomon@gmail.com` |
| Zone setting | `email_obfuscation` | `on` (left on deliberately; code uses `<!--email_off-->`) |

Existing DNS records you must **not** break (import as-is or leave unmanaged,
decide explicitly): 4 x `A aitoolreview.ai 185.199.108-111.153` (GitHub Pages,
to be replaced at cutover), `CNAME www` to `achisolomon.github.io` (proxied, the
redirect rule depends on www being proxied), Cloudflare Email Routing MX x3,
SPF TXT, `cf2024-1._domainkey` DKIM, Resend `send` / `rsend` CNAMEs and
`resend._domainkey`, Google site verification TXT.

Shared, account-level, **do not manage from this repo**: Zero Trust org
(`hearfyinnercircle.cloudflareaccess.com`) and the Google IdP. Reference them
by id (data source or variable).

## Pending work this codification must account for

1. **Push-triggered builds do not fire** for `aitoolreview` (all builds so far
   are `ad_hoc`; Hearfy, created in the dashboard, gets `github:push`). The
   project was created through the API and the GitHub push hook was never
   registered. User was asked to reconnect the repo in the dashboard (Settings >
   Build > Git repository), or recreate via dashboard "Connect to Git".
   Consequence for IaC: creating a git-connected Pages project from Terraform
   likely has the same gap. Import the dashboard-connected project; do not let
   Terraform replace it. If it was recreated, the pages.dev suffix may change:
   update the Access destination, `js/supabase-client.js`, and the Supabase dev
   redirect URL `https://*.<new>.pages.dev/**`.
2. **Cutover not done yet**: attach `aitoolreview.ai` to the Pages project and
   replace the 4 GitHub `A` records. Then disable GitHub Pages and make the repo
   private (needs explicit user approval). Codify the end state, not the interim.
3. Access testers live in the inline policy because creating an Access group
   needed a scope the user did not grant. In IaC prefer a reusable policy or
   group with an email list variable.

## Credentials (open decision, ask the user)

The user does not want long-lived tokens. The `cf` CLI is signed in via OAuth
(no token on disk for Terraform to reuse). Options to put to the user:
a short-lived scoped API token created at run time and revoked after apply;
or keep Terraform local-only, run by the user. Never commit a token, never put
one in GitHub secrets without asking. State backend is also open (local file in
a private repo vs. R2 bucket); ask.

## Acceptance

- `terraform plan` after imports: no changes.
- Verify still true after any apply:
  - `curl -sI http://aitoolreview.ai/` returns 301 to https
  - `curl -sI https://aitoolreview.ai/index.html` returns 301 to `/`
  - `curl -sI https://www.aitoolreview.ai/` returns 301 to apex
  - `curl -sI https://dev.aitoolreview.ai/` returns 302 to the Access login
  - `curl -sI https://<any-branch>.aitoolreview-7pc.pages.dev/` returns 302 to the Access login
  - Email still delivers (MX/SPF/DKIM untouched)
- Out of scope: Supabase config, Google OAuth client, GitHub settings.
