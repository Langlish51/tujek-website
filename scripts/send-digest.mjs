#!/usr/bin/env node
// Sends the weekly Insights brief to subscribers as two Resend broadcasts (EN + FR),
// built from articles.json. Runs in GitHub Actions (.github/workflows/send-digest.yml)
// after every push to main that touches articles.json, i.e. right after the weekly refresh.
//
//   node scripts/send-digest.mjs            # send (skips if "updated" did not change since the previous commit)
//   node scripts/send-digest.mjs --force    # send even if "updated" is unchanged
//   node scripts/send-digest.mjs --dry-run  # no API calls: writes scripts/preview/digest-{en,fr}.html
//   node scripts/send-digest.mjs --lang=fr  # only one language
//
// Env: RESEND_API_KEY, RESEND_SEGMENT_EN, RESEND_SEGMENT_FR (required to send),
//      INSIGHTS_FROM, INSIGHTS_REPLY_TO, SITE_URL (optional overrides).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, isConfigured, resend, digestEmail } from '../netlify/lib/mail.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const force = args.has('--force');
const langArg = [...args].find((a) => a.startsWith('--lang='));
const langs = langArg ? [langArg.slice(7)] : ['en', 'fr'];

// Resend replaces this per recipient with their personal unsubscribe link.
const UNSUB = '{{{RESEND_UNSUBSCRIBE_URL}}}';

function log(...m) { console.log('[send-digest]', ...m); }
function warn(m) { console.log(`::warning::${m}`); log(m); }

const data = JSON.parse(readFileSync(resolve(root, 'articles.json'), 'utf8'));
if (!Array.isArray(data.articles) || data.articles.length === 0) {
  warn('articles.json has no articles — nothing to send.');
  process.exit(0);
}

// Idempotency: only send when the "updated" stamp actually moved.
if (!force && !dryRun) {
  let previous = null;
  try {
    previous = JSON.parse(execSync('git show HEAD~1:articles.json', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8'));
  } catch { /* first commit or shallow clone: treat as changed */ }
  if (previous && previous.updated === data.updated) {
    log(`"updated" is still ${data.updated} — the brief for this date was already sent. Skipping (use --force to resend).`);
    process.exit(0);
  }
}

const c = config();

if (dryRun) {
  const out = resolve(here, 'preview');
  mkdirSync(out, { recursive: true });
  for (const lang of langs) {
    const mail = digestEmail({ lang, data, unsubscribeUrl: 'https://example.invalid/unsubscribe', siteUrl: c.siteUrl });
    const file = resolve(out, `digest-${lang}.html`);
    writeFileSync(file, mail.html, 'utf8');
    writeFileSync(resolve(out, `digest-${lang}.txt`), mail.text, 'utf8');
    log(`${lang}: "${mail.subject}" -> ${file}`);
  }
  process.exit(0);
}

if (!isConfigured(c)) {
  warn('Resend is not configured (RESEND_API_KEY, RESEND_SEGMENT_EN, RESEND_SEGMENT_FR). Nothing sent.');
  process.exit(0);
}

let failures = 0;
for (const lang of langs) {
  const segment = c.segments[lang];
  const mail = digestEmail({ lang, data, unsubscribeUrl: UNSUB, siteUrl: c.siteUrl });
  try {
    // One call: create the broadcast for the language segment and send it right away.
    const created = await resend(c, 'POST', '/broadcasts', {
      segment_id: segment,
      from: c.from,
      reply_to: c.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      name: `Insights ${lang.toUpperCase()} ${data.updated}`,
      send: true,
    });
    const id = created && created.id;
    if (!id) throw new Error('broadcast created without an id: ' + JSON.stringify(created));
    log(`${lang}: sent broadcast ${id} — "${mail.subject}" (${data.articles.length} articles)`);
  } catch (err) {
    const msg = String(err.message || err);
    if (/no contacts|empty|has no subscribers/i.test(msg)) {
      warn(`${lang}: segment has no subscribers yet — skipped.`);
      continue;
    }
    failures++;
    console.error(`[send-digest] ${lang}: FAILED — ${msg}`);
  }
}

process.exit(failures ? 1 : 0);
