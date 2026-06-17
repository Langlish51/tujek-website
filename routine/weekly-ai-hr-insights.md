# Weekly "AI in HR" Insights routine

This is the spec for the scheduled task that refreshes `articles.json` each week.
It is **idempotent** — safe to run on multiple machines. Whichever machine runs
first on a given day does the refresh; the others see it's already done and skip.

## Set it up on a machine

Open Claude Code on that machine and say:

> "Create a weekly scheduled task called `weekly-ai-hr-insights` using the prompt
> in `routine/weekly-ai-hr-insights.md` of the tujek-website repo. Run it **Monday
> late morning** (cron `30 11 * * 1`)."

(This laptop already runs it Monday **07:07**. Use a *later* time on the second
laptop — e.g. **11:30** — so the early machine usually does the work and the second
only acts as a fallback when the first was off.)

The machine needs git authenticated to GitHub (e.g. `gh auth login`) so the task can push.

## The task prompt

You maintain the "Insights" section of Franck Tujek's bilingual (English/French) consulting website by keeping articles.json fresh. This task may run on more than one machine, so it is IDEMPOTENT: if today's refresh was already done (by another machine), it does nothing.

REPOSITORY: github.com/Langlish51/tujek-website (publishes via Netlify/GitHub Pages). Push credentials are in the OS credential store — do NOT add or echo any token.

STEP 0 — LOCATE THE LOCAL CLONE (PowerShell):
- Use the first of these that is a git clone of Langlish51/tujek-website: "C:\Users\franc\Documents\website".
- If none exists, run: git clone https://github.com/Langlish51/tujek-website.git "$HOME\Documents\tujek-website"  and use that folder.
- cd into the folder and run: git pull --ff-only

STEP 1 — IDEMPOTENCY GUARD:
- Read articles.json and get its "updated" field. Compute today's date (YYYY-MM-DD, local).
- If "updated" already equals today's date, STOP NOW: report "Already refreshed today — nothing to do." Do not search, edit, commit, or push.

STEP 2 — CURATE (only if not already refreshed today):
- Note the URLs already in articles.json (avoid repeating them unless still clearly most relevant).
- Use WebSearch to find the most relevant, high-quality articles on AI in HR and HRIS published in roughly the LAST 2 WEEKS. Broad net across reputable HR/tech publications (HR Dive, HR Executive, Josh Bersin, SHRM, UNLEASH, HR Brew, People Matters, McKinsey, and major HRIS vendor/analyst coverage — Workday, SAP SuccessFactors, Oracle). Prefer substantive analysis over thin listicles or marketing. Verify each URL is a real, working article link.
- Select the best ~6 (5-7 ok). For each, write a tight 2-3 bullet summary for a senior HR leader, in BOTH English and French (natural professional translation, same number of bullets). Keep title and source in their ORIGINAL language.

STEP 3 — WRITE articles.json (UTF-8, no BOM) EXACTLY in this shape:
{
  "updated": "YYYY-MM-DD",
  "articles": [
    { "title": "...", "url": "https://...", "source": "...", "date": "YYYY-MM-DD",
      "summary": { "en": ["...","..."], "fr": ["...","..."] } }
  ]
}
Rules: valid JSON, double quotes, no trailing commas, no comments. Each language array has 2-3 strings and the SAME count. English may use straight ASCII quotes; French uses natural characters. Keep ~6 articles total.

STEP 4 — VALIDATE: confirm it parses (PowerShell: Get-Content articles.json -Raw | ConvertFrom-Json). If it doesn't parse, fix it. If WebSearch found nothing usable, leave articles.json unchanged and stop — never publish an empty or broken list.

STEP 5 — PUBLISH (only if articles.json actually changed):
  git add articles.json
  git commit -m "chore: insights refresh (<today>)"
  git pull --rebase --autostash origin main
  git push origin main
The host redeploys automatically.

STEP 6 — REPORT: number of articles, their titles, and whether you pushed. If you skipped, say why.

CONSTRAINTS: ~6 articles max; only real, linkable, accurately-summarized articles (never invent titles/dates/quotes); always provide BOTH en and fr; modify only articles.json (never index.html); never print/commit credentials.
