# Tujek Consulting — website

Live site: **https://langlish51.github.io/tujek-website/**
Hosting: GitHub Pages (branch `main`, root folder). Push to `main` → it redeploys automatically (~1 min).

## Files

| File | What it is |
|------|------------|
| `index.html` | The **published page**. It's a self-extracting bundle — the real page and assets are packed inside. **Don't hand-edit it**; run `build.ps1` instead. |
| `_template_extracted.html` | The **editable page source**: HTML, CSS, and inline scripts. Edit this for layout / styling / text. |
| `_bundle.js` | The **editable JS bundle**, including the EN/FR translation dictionary (`I18N`). Edit this for translations or behaviour. |
| `articles.json` | The **Insights list** (title, url, source, date, EN + FR summaries). Refreshed weekly; can be hand-edited. |
| `build.ps1` | Repacks `_template_extracted.html` + `_bundle.js` back into `index.html`. |
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

Edit `articles.json` directly (keep the schema — each `summary` has an `en` and `fr` array of 2–3 strings), then commit and push. **No build step needed** (the page fetches this file at runtime).

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

## Work from another laptop

```powershell
git clone https://github.com/Langlish51/tujek-website.git
cd tujek-website
```

You need git authenticated to GitHub on that machine — either install the GitHub CLI and run `gh auth login`, or use a Personal Access Token. Then edit / `build.ps1` / push exactly as above.
