# Weekly "HR technology" Insights routine

This is the spec for the cloud routine that refreshes `articles.json` each week
(claude.ai → Code → Routines, runs Thursday 22:15 UTC). It is **idempotent**: if
`articles.json` already carries today's date, it does nothing, so a second copy on
another machine or schedule is harmless.

After the push, the GitHub Action `send-digest.yml` emails the brief to subscribers.
The routine itself needs no email credentials.

## The routine prompt

You maintain the "Insights" section of Franck Tujek's bilingual (English/French) HR-technology consulting website by keeping articles.json fresh. Franck's core business is delivering SAP SuccessFactors and Workday programmes for large organisations; the audience is senior HR, HRIS and IT leaders. The task is IDEMPOTENT: if today's refresh was already done, it does nothing.

REPOSITORY: github.com/Langlish51/tujek-website (main branch; Netlify redeploys on push). Never print, add or echo any credential.

STEP 0 — WORKSPACE: work in the checked-out repo. Run `git pull --ff-only origin main` first.

STEP 1 — IDEMPOTENCY GUARD: read articles.json and its "updated" field. Compute today's date (YYYY-MM-DD, UTC). If "updated" equals today, STOP: report "Already refreshed today — nothing to do." Do not search, edit, commit or push.

STEP 2 — CURATE (only if not already refreshed today). Note the URLs already in articles.json and do not repeat them.
Use WebSearch to find substantive articles published in roughly the LAST 2 WEEKS. WebFetch may be blocked in this environment: if it fails, rely on the WebSearch results (titles, snippets, dates) and only include URLs that actually appeared in search results. Build a MIX of about 6 articles (5–7) with this balance:
  • 2–3 on **SAP SuccessFactors and/or Workday** (at least one of each when possible): release highlights (SuccessFactors 1H/2H releases, Workday feature releases), roadmap and strategy, Joule / Workday Illuminate and agents, customer stories and implementation lessons, analyst and partner commentary, pricing/licensing or ecosystem news (SAP, Workday, big SIs, Fosway, Gartner, Josh Bersin).
  • 1–2 on **AI in HR / HRIS** more broadly (agents, skills intelligence, governance, adoption evidence).
  • 1–2 on the **wider HR technology market**: Oracle HCM, Dayforce, UKG, Personio, payroll and global payroll, integration and HR data platforms, skills and talent tech, HR analytics, vendor M&A and funding, implementation and change-management practice.
DIVERSITY RULES: never include more than ONE article about the same event or report (for example several vendors each announcing the same Gartner Magic Quadrant — pick one, or better an independent analysis of it). Vendor press releases count for at most 2 of the ~6 and only when they carry real substance (release content, customer results, pricing). The rest must be independent reporting or analysis.
Sources to search across: SAP News Center, SAP Community blogs, Workday Newsroom and Workday Blog, Diginomica, HR Executive, HR Dive, UNLEASH, HR Brew, Josh Bersin, Fosway, Gartner, People Matters, TechTarget, Computer Weekly, Forbes/Fortune HR coverage, and big-SI insights (Deloitte, Accenture, EY, PwC, KPMG). Prefer analysis, release notes with real substance, and customer/implementation stories over thin press releases or vendor marketing. Never invent titles, dates or quotes.

For each article write a tight 2–3 bullet summary for a senior HR/HRIS leader, in BOTH English and French (natural professional French, same number of bullets, no machine-translation feel). Keep title and source in their ORIGINAL language. Where relevant, end a bullet with the practical "so what" for someone running a SuccessFactors or Workday programme.

STEP 3 — WRITE articles.json (UTF-8, no BOM) EXACTLY in this shape, newest first:
{
  "updated": "YYYY-MM-DD",
  "articles": [
    { "title": "...", "url": "https://...", "source": "...", "date": "YYYY-MM-DD",
      "summary": { "en": ["...","..."], "fr": ["...","..."] } }
  ]
}
Rules: valid JSON, double quotes, no trailing commas, no comments. Each language array has 2–3 strings and the SAME count. French uses proper accents and « » where natural. Keep ~6 articles total (replace the whole list; do not append to the old one).

STEP 4 — VALIDATE: confirm it parses (node -e "JSON.parse(require('fs').readFileSync('articles.json','utf8'))"). If it does not parse, fix it. If the search found nothing usable, leave articles.json unchanged and stop; never publish an empty or broken list.

STEP 5 — PUBLISH (only if articles.json actually changed):
  git add articles.json
  git commit -m "chore: insights refresh (<today>)"
  git pull --rebase --autostash origin main
  git push origin main
Netlify redeploys automatically, and the send-digest GitHub Action emails subscribers.

STEP 6 — REPORT: number of articles, their titles with the category each covers (SuccessFactors / Workday / AI in HR / wider HR tech), and whether you pushed. If you skipped (already refreshed today, or nothing usable), say so.

CONSTRAINTS: ~6 articles; only real, linkable, accurately summarised articles; always both en and fr; modify only articles.json (never index.html or anything else); never print or commit credentials.
