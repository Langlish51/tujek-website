# Tujek Consulting — website

Live site: **https://tujekconsulting.ai** and **https://tujekconsulting.com** (Netlify, project "Tujek Consulting").
Secondary copy: https://langlish51.github.io/tujek-website/ (GitHub Pages, same branch).

Push to `main` → Netlify redeploys both domains automatically (~1 min). GitHub Pages follows too.

## The moving parts (where everything lives)

| Piece | Where | Notes |
|------|-------|-------|
| Code, workflow, routine spec | this repo, branch `main` | Everything needed to work from any laptop is here. No secrets in the repo. |
| Hosting + serverless functions | **Netlify** (app.netlify.com → Tujek Consulting) | Publish dir = repo root, no build. `netlify.toml` declares the functions and a deploy-skip rule. Env vars for Resend live here (Site configuration → Environment variables). |
| DNS | **Squarespace** (account.squarespace.com → Domains → tujekconsulting.ai → DNS) | A/CNAME to Netlify, MX to Google Workspace, Resend's DKIM + `send`/`rsend` CNAMEs + `_dmarc`. |
| Mailbox | Google Workspace | `Franck@Tujekconsulting.ai` — reply-to of every email the site sends. |
| Mailing list + sending | **Resend** (resend.com, account francktujek) | Domain `tujekconsulting.ai` verified. Audience → Segments `Insights EN` / `Insights FR`. Broadcasts show delivery stats. |
| Weekly article refresh | **Claude cloud routine** "Weekly HR-tech Insights refresh (tujekconsulting.ai) — KEEP" at https://claude.ai/code/routines | Thursday 22:15 UTC (Friday 08:15 Melbourne). Prompt mirrored in `routine/weekly-hr-tech-insights.md`. Runs without any laptop being on. |
| Weekly email send | **GitHub Action** `.github/workflows/send-digest.yml` | Fires on every push that changes `articles.json`. Secrets in repo Settings → Secrets and variables → Actions. Manual re-send: Actions → *Send Insights digest* → Run workflow (force). |
| Email capture fallback | Netlify → Forms → `newsletter` | Only used if the Resend function is unavailable. Owner gets a "Form submission" email each time. |

**Netlify free plan = 300 credits/month, 15 per production deploy (≈20 deploys).** Batch site edits into as few pushes as you can. Commits touching only `.github/`, `scripts/`, `routine/`, `README.md` or `.gitignore` are skipped by the deploy-skip rule and cost nothing.

## Files

| File | What it is |
|------|------------|
| `index.html` | The **published page**. It's a self-extracting bundle — the real page and assets are packed inside. **Don't hand-edit it**; run `build.ps1` instead. |
| `_template_extracted.html` | The **editable page source**: HTML, CSS, and inline scripts. Edit this for layout / styling / text. |
| `_bundle.js` | The **editable JS bundle**, including the EN/FR translation dictionary (`I18N`). Edit this for translations or behaviour. |
| `articles.json` | The **Insights list** (title, url, source, date, EN + FR summaries). Refreshed weekly by the cloud routine; can be hand-edited. |
| `build.ps1` | Repacks `_template_extracted.html` + `_bundle.js` back into `index.html` (PowerShell, Windows). |
| `netlify.toml` | Netlify config: publish dir, functions dir, deploy-skip rule. |
| `netlify/functions/*.mjs`, `netlify/lib/mail.mjs` | Subscribe / unsubscribe functions and the shared email copy + layout. |
| `scripts/send-digest.mjs` | Builds and sends the weekly brief (run by the GitHub Action). |
| `.github/workflows/send-digest.yml` | The Action that runs the script after each `articles.json` push. |
| `routine/weekly-hr-tech-insights.md` | The prompt the cloud routine runs, kept in sync by hand. |
| `index.backup.html` | Local pre-edit backup (gitignored — not in the repo). |

## Edit the page (layout, styles, text, translations)

```powershell
# 1. Edit _template_extracted.html and/or _bundle.js
# 2. Repack into index.html
./build.ps1
# 3. Preview locally
python -m http.server 8098      # then open http://localhost:8098/index.html
# 4. Publish
git add -A
git commit -m "describe the change"
git push
```

## Edit only the article list

Edit `articles.json` directly (keep the schema — each `summary` has an `en` and `fr` array of 2–3 strings), then commit and push. **No build step needed** (the page fetches this file at runtime). Note: a push that changes `articles.json` **emails the brief to subscribers** if the `updated` date changed; to fix a typo without re-sending, leave `updated` as it is.

```json
{
  "updated": "YYYY-MM-DD",
  "articles": [
    {
      "title": "…", "url": "https://…", "source": "…", "date": "YYYY-MM-DD",
      "summary": { "en": ["…", "…"], "fr": ["…", "…"] }
    }
  ]
}
```

## Insights mailing list (subscribe form → welcome email → weekly brief)

Provider: **[Resend](https://resend.com)** (free tier: 3,000 emails/month; one contact list with **segments**, broadcasts and unsubscribe handling built in).

| Piece | Where | What it does |
|------|-------|--------------|
| `netlify/functions/subscribe.mjs` | Netlify function, `POST /.netlify/functions/subscribe` | Creates the contact in Resend inside the EN or FR **segment** (matching the site language) and sends a warm **welcome email** with a signed unsubscribe link. Returning addresses are re-activated. If Resend isn't configured it returns 503 and the site form **falls back to Netlify Forms**, so no address is ever lost. |
| `netlify/functions/unsubscribe.mjs` | Netlify function, `GET /.netlify/functions/unsubscribe?e=&l=&t=` | Signed one-click unsubscribe used by the welcome email (global opt-out on the contact). Shows a bilingual confirmation page. |
| `netlify/lib/mail.mjs` | shared | Copy (EN/FR), HTML email layout, Resend API helper, contact helpers, link signing. |
| `scripts/send-digest.mjs` | GitHub Action `.github/workflows/send-digest.yml` | After every push to `main` that changes `articles.json` (i.e. the weekly refresh), builds the **weekly brief** in EN and FR from `articles.json` and sends it as two Resend broadcasts, one per segment. Resend inserts each recipient's own unsubscribe link (`{{{RESEND_UNSUBSCRIBE_URL}}}`). Skips when the `updated` date did not change. |

### One-time setup

1. **Resend account** → *Domains* → add `tujekconsulting.ai` and create the DNS records it shows (DKIM TXT + two CNAMEs + optional DMARC) at the DNS host (Squarespace). Sending from `insights@tujekconsulting.ai` only works once the domain shows *Verified*.
2. **Resend → Audience → Segments**: create two segments, `Insights EN` and `Insights FR`. Open each and copy its **segment ID** (UUID).
3. **Resend → API keys**: create a key with *Full access* (it must write contacts, send emails and broadcasts).
4. **Netlify → Site configuration → Environment variables** (both scopes, all deploy contexts):
   `RESEND_API_KEY`, `RESEND_SEGMENT_EN`, `RESEND_SEGMENT_FR`, and optionally `UNSUBSCRIBE_SECRET` (any long random string; used to sign the welcome-email unsubscribe links), `INSIGHTS_FROM` (default `Franck Tujek <insights@tujekconsulting.ai>`), `INSIGHTS_REPLY_TO` (default `Franck@Tujekconsulting.ai`). Redeploy once so the functions pick them up.
5. **GitHub → repo → Settings → Secrets and variables → Actions**: secrets `RESEND_API_KEY`, `RESEND_SEGMENT_EN`, `RESEND_SEGMENT_FR`; optional variables `INSIGHTS_FROM`, `INSIGHTS_REPLY_TO`.
6. **Test**: subscribe with your own address on the live site (you should get the welcome email within a minute), then GitHub → *Actions* → *Send Insights digest* → *Run workflow* with **force = true** to send this week's brief immediately.

### Day to day

- Subscribers, unsubscribes and delivery stats live in the Resend dashboard (Audience → Contacts / Segments, and Broadcasts).
- Every new (or returning) subscriber also triggers a short heads-up email to `Franck@Tujekconsulting.ai` ("New subscriber (EN): …"). Change the recipient with the Netlify env var `SUBSCRIBE_NOTIFY`; set it to an empty string to turn it off.
- Preview the brief without sending: `node scripts/send-digest.mjs --dry-run` → opens as `scripts/preview/digest-en.html` / `digest-fr.html`.
- Re-send a brief: *Actions → Send Insights digest → Run workflow* (force = true, optional `lang`).
- Change the wording of the welcome note or the brief: edit the `COPY` block in `netlify/lib/mail.mjs`.
- The weekly cloud routine only touches `articles.json`; the Action does the sending, so the routine needs no email credentials.

## Work from another laptop

```powershell
git clone https://github.com/Langlish51/tujek-website.git
cd tujek-website
```

Needed on the machine:
- **git** authenticated to GitHub (install the GitHub CLI and run `gh auth login`, or use a Personal Access Token). Push to `main` is the only thing that publishes.
- **PowerShell** for `build.ps1` (Windows built-in) — only when editing the page itself.
- **Node 20+** for `node scripts/send-digest.mjs --dry-run` (email previews) — optional.
- **Nothing else.** No API keys are needed locally: Resend keys live in Netlify and GitHub, and the weekly routine runs in Claude's cloud. If you ever need to change a key, do it in the Resend / Netlify / GitHub web UIs listed in "The moving parts".

Then edit / `build.ps1` / push exactly as above. If two laptops both have the clone, `git pull --ff-only` before editing.

## Changing the wording or the focus

- Site text (EN/FR): `_bundle.js` (`I18N` dictionary) and the defaults in `_template_extracted.html`, then `build.ps1`.
- Welcome email and weekly brief text: the `COPY` block in `netlify/lib/mail.mjs`. Preview with `node scripts/send-digest.mjs --dry-run`.
- What the routine curates (topics, mix, sources): edit the routine at https://claude.ai/code/routines (open it → edit prompt) **and** paste the same text into `routine/weekly-hr-tech-insights.md` so the repo stays the source of truth.
