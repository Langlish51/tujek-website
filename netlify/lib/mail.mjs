// Shared helpers for the Insights mailing list.
// Used by the Netlify functions (subscribe / unsubscribe) and by scripts/send-digest.mjs.
// Provider: Resend (https://resend.com) — one contact list per account; two SEGMENTS (EN, FR)
// group the subscribers by language; broadcasts target a segment and carry Resend's own
// per-recipient unsubscribe link. A contact's "unsubscribed" flag is global (all broadcasts).

import { createHmac, timingSafeEqual } from 'node:crypto';

export const SITE = {
  url: 'https://tujekconsulting.ai',
  name: 'Tujek Consulting',
  owner: 'Franck Tujek',
};

const P = {
  navy: '#0f1e3d',
  navyDeep: '#0a1530',
  blue: '#3b6fd4',
  paper: '#f6f7fb',
  white: '#ffffff',
  ink: '#0f1e3d',
  muted: '#5b6477',
  mutedLight: '#9aa3b5',
  line: '#e2e6ef',
};

// ---------- configuration (all secrets come from environment variables) ----------

export function config(env = process.env) {
  return {
    apiKey: env.RESEND_API_KEY || '',
    // Segment IDs (Resend -> Audience -> Segments). The old *_AUDIENCE_* names still work.
    segments: {
      en: env.RESEND_SEGMENT_EN || env.RESEND_AUDIENCE_EN || '',
      fr: env.RESEND_SEGMENT_FR || env.RESEND_AUDIENCE_FR || '',
    },
    from: env.INSIGHTS_FROM || `${SITE.owner} <insights@tujekconsulting.ai>`,
    replyTo: env.INSIGHTS_REPLY_TO || 'Franck@Tujekconsulting.ai',
    // Where to send the "new subscriber" heads-up. Empty string disables it.
    notifyTo: env.SUBSCRIBE_NOTIFY === undefined ? (env.INSIGHTS_REPLY_TO || 'Franck@Tujekconsulting.ai') : env.SUBSCRIBE_NOTIFY,
    siteUrl: (env.SITE_URL || SITE.url).replace(/\/+$/, ''),
    // Separate secret is best; falls back to the API key so one variable is enough to start.
    unsubSecret: env.UNSUBSCRIBE_SECRET || env.RESEND_API_KEY || '',
  };
}

export function isConfigured(c) {
  return Boolean(c.apiKey && c.segments.en && c.segments.fr);
}

// ---------- contacts ----------

// Create the contact inside the language segment; if the address already exists
// (came back after unsubscribing, or subscribed in the other language), re-activate it
// and add it to the segment instead.
export async function subscribeContact(c, email, lang) {
  const segment = c.segments[lang];
  try {
    await resend(c, 'POST', '/contacts', { email, unsubscribed: false, segments: [{ id: segment }] });
    return 'created';
  } catch (err) {
    if (err.status === 401 || err.status === 403 || err.status >= 500) throw err;
    try {
      await resend(c, 'PATCH', `/contacts/${encodeURIComponent(email)}`, { unsubscribed: false });
      await resend(c, 'POST', `/contacts/${encodeURIComponent(email)}/segments/${segment}`);
      return 'reactivated';
    } catch (err2) {
      // Report the original failure: it is the more informative one.
      err.message += ` (fallback also failed: ${err2.message})`;
      throw err;
    }
  }
}

// Global opt-out: the contact stops receiving every broadcast.
export async function unsubscribeContact(c, email) {
  await resend(c, 'PATCH', `/contacts/${encodeURIComponent(email)}`, { unsubscribed: true });
}

// ---------- Resend API ----------

export async function resend(c, method, path, body) {
  const r = await fetch('https://api.resend.com' + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + c.apiKey,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }
  if (!r.ok) {
    const err = new Error(`Resend ${method} ${path} -> HTTP ${r.status}: ${(data && (data.message || data.error)) || text}`);
    err.status = r.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---------- input normalisation ----------

export function normLang(l) {
  return String(l || '').trim().toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function normEmail(e) {
  return String(e || '').trim().toLowerCase();
}

export function validEmail(e) {
  return typeof e === 'string' && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

// ---------- signed unsubscribe links (used in the welcome email) ----------

export function unsubToken(c, email, lang) {
  return createHmac('sha256', c.unsubSecret).update(`${email}|${lang}`).digest('hex').slice(0, 32);
}

export function unsubLink(c, email, lang) {
  const q = new URLSearchParams({ e: email, l: lang, t: unsubToken(c, email, lang) });
  return `${c.siteUrl}/.netlify/functions/unsubscribe?${q.toString()}`;
}

export function tokenOk(c, email, lang, token) {
  const a = Buffer.from(unsubToken(c, email, lang));
  const b = Buffer.from(String(token || ''));
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------- copy ----------

const COPY = {
  en: {
    welcomeSubject: 'Welcome — you’re on the list',
    welcomePre: 'A short note from Franck, and what to expect from the brief.',
    welcome: [
      'Hi there,',
      'Thanks for subscribing to the Insights brief. Roughly once a week, I send a short, hand-picked selection of what is worth reading in HR technology: SAP SuccessFactors, Workday, AI in HR and the wider HRIS market. Five or six articles, each summarised in a few lines so you can decide in seconds what deserves your attention.',
      'No noise, no sales pitch. Just the pieces I would forward to a colleague.',
      'If something in a brief sparks a question or a project, hit reply. I read every message.',
    ],
    digestSubject: (d) => `HR tech — this week’s brief (${d})`,
    digestPre: (n) => `${n} articles worth your time this week, each summarised in a few lines.`,
    digestIntro: [
      'Hi there,',
      'Here is this week’s brief: the articles on HR technology that I found worth your time, from SuccessFactors and Workday to AI in HR and the wider HRIS market, each summarised in a few lines. Grab a coffee, this takes about three minutes.',
    ],
    digestOutro: [
      'That is it for this week. If one of these resonates with something you are working on, reply and tell me about it. I would love to hear how it plays out.',
    ],
    readMore: 'Read the article',
    signoff: 'Warmly,',
    signature: 'Franck',
    signatureRole: 'Tujek Consulting — enterprise HR systems, built for your reality.',
    footer: 'You are receiving this because you subscribed to the Insights brief at',
    unsubscribe: 'Unsubscribe',
    viewSite: 'Visit the site',
    locale: 'en-GB',
  },
  fr: {
    welcomeSubject: 'Bienvenue — vous êtes inscrit·e',
    welcomePre: 'Un petit mot de Franck, et ce que vous recevrez.',
    welcome: [
      'Bonjour,',
      'Merci de vous être abonné·e à la synthèse Insights. Environ une fois par semaine, je vous envoie une sélection courte et choisie de ce qui mérite d’être lu sur les technologies RH : SAP SuccessFactors, Workday, l’IA dans les RH et le marché des SIRH. Cinq ou six articles, chacun résumé en quelques lignes pour décider en quelques secondes de ce qui vaut votre attention.',
      'Sans bruit ni discours commercial. Uniquement les articles que je transmettrais à un collègue.',
      'Si une synthèse vous inspire une question ou un projet, répondez simplement à cet e-mail. Je lis chaque message.',
    ],
    digestSubject: (d) => `Technologies RH — la synthèse de la semaine (${d})`,
    digestPre: (n) => `${n} articles qui méritent votre attention cette semaine, résumés en quelques lignes.`,
    digestIntro: [
      'Bonjour,',
      'Voici la synthèse de la semaine : les articles sur les technologies RH qui m’ont paru mériter votre temps, de SuccessFactors et Workday à l’IA dans les RH et au marché des SIRH, chacun résumé en quelques lignes. Prenez un café, cela prend environ trois minutes.',
    ],
    digestOutro: [
      'C’est tout pour cette semaine. Si l’un de ces sujets fait écho à un projet en cours chez vous, répondez-moi et racontez. J’aimerais beaucoup savoir comment cela se passe.',
    ],
    readMore: 'Lire l’article',
    signoff: 'Chaleureusement,',
    signature: 'Franck',
    signatureRole: 'Tujek Consulting — des SIRH d’entreprise, conçus pour votre réalité.',
    footer: 'Vous recevez cet e-mail parce que vous vous êtes abonné·e à la synthèse Insights sur',
    unsubscribe: 'Se désabonner',
    viewSite: 'Voir le site',
    locale: 'fr-FR',
  },
};

export function copy(lang) {
  return COPY[normLang(lang)];
}

export function formatDate(iso, lang) {
  const d = new Date(String(iso) + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return String(iso || '');
  return d.toLocaleDateString(copy(lang).locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- HTML layout (table-based, inline styles: works in Outlook/Gmail/Apple Mail) ----------

const FONT = "'IBM Plex Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Spectral, Georgia, 'Times New Roman', serif";

function para(text, extra = '') {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:${P.ink};${extra}">${text}</p>`;
}

function layout({ lang, preheader, body, unsubscribeUrl, siteUrl }) {
  const t = copy(lang);
  const site = siteUrl || SITE.url;
  const host = site.replace(/^https?:\/\//, '');
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(preheader)}</title>
</head>
<body style="margin:0;padding:0;background:${P.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${P.paper};">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
  <tr><td style="background:${P.navy};border-radius:14px 14px 0 0;padding:26px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:${SERIF};font-size:22px;color:${P.white};letter-spacing:0.2px;">Tujek <span style="color:${P.blue};">Consulting</span></td>
      <td align="right" style="font-family:${FONT};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${P.mutedLight};">Insights</td>
    </tr></table>
  </td></tr>
  <tr><td style="background:${P.white};padding:34px 32px 10px;border-left:1px solid ${P.line};border-right:1px solid ${P.line};">
    ${body}
  </td></tr>
  <tr><td style="background:${P.white};padding:6px 32px 30px;border-left:1px solid ${P.line};border-right:1px solid ${P.line};border-bottom:1px solid ${P.line};border-radius:0 0 14px 14px;">
    <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.6;color:${P.ink};">${t.signoff}<br><strong style="font-family:${SERIF};font-size:19px;font-weight:500;">${t.signature}</strong></p>
    <p style="margin:6px 0 0;font-family:${FONT};font-size:13px;line-height:1.5;color:${P.muted};">${t.signatureRole}</p>
  </td></tr>
  <tr><td style="padding:22px 24px 0;text-align:center;font-family:${FONT};font-size:12px;line-height:1.7;color:${P.mutedLight};">
    ${t.footer} <a href="${site}" style="color:${P.muted};text-decoration:underline;">${host}</a>.<br>
    <a href="${unsubscribeUrl}" style="color:${P.muted};text-decoration:underline;">${t.unsubscribe}</a>
    &nbsp;·&nbsp;
    <a href="${site}#insights" style="color:${P.muted};text-decoration:underline;">${t.viewSite}</a>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ---------- the welcome email (sent by the subscribe function) ----------

export function welcomeEmail({ lang, unsubscribeUrl, siteUrl }) {
  const L = normLang(lang);
  const t = copy(L);
  const body = t.welcome.map((p) => para(esc(p))).join('');
  const text = [...t.welcome, '', t.signoff, t.signature, t.signatureRole, '', `${t.unsubscribe}: ${unsubscribeUrl}`].join('\n');
  return {
    subject: t.welcomeSubject,
    html: layout({ lang: L, preheader: t.welcomePre, body, unsubscribeUrl, siteUrl }),
    text,
  };
}

// ---------- the weekly digest (sent by scripts/send-digest.mjs as a Resend broadcast) ----------

function articleBlock(a, lang) {
  const t = copy(lang);
  const bullets = ((a.summary && a.summary[lang]) || (a.summary && a.summary.en) || [])
    .map((b) => `<li style="margin:0 0 7px;">${esc(b)}</li>`)
    .join('');
  const meta = [a.source, a.date ? formatDate(a.date, lang) : '']
    .filter(Boolean)
    .map(esc)
    .join(' &nbsp;·&nbsp; ');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
      <tr><td style="padding:20px 0 0;border-top:1px solid ${P.line};">
        <p style="margin:0 0 4px;font-family:${FONT};font-size:12px;letter-spacing:0.8px;text-transform:uppercase;color:${P.mutedLight};">${meta}</p>
        <h2 style="margin:0 0 10px;font-family:${SERIF};font-weight:500;font-size:20px;line-height:1.3;color:${P.ink};">
          <a href="${esc(a.url)}" style="color:${P.ink};text-decoration:none;">${esc(a.title)}</a>
        </h2>
        <ul style="margin:0 0 12px;padding:0 0 0 20px;font-family:${FONT};font-size:15px;line-height:1.55;color:${P.ink};">${bullets}</ul>
        <a href="${esc(a.url)}" style="font-family:${FONT};font-size:14px;font-weight:600;color:${P.blue};text-decoration:none;">${t.readMore} →</a>
      </td></tr>
    </table>`;
}

export function digestEmail({ lang, data, unsubscribeUrl, siteUrl }) {
  const L = normLang(lang);
  const t = copy(L);
  const articles = Array.isArray(data && data.articles) ? data.articles : [];
  const dateLabel = formatDate(data && data.updated, L);
  const body =
    t.digestIntro.map((p) => para(esc(p))).join('') +
    `<div style="height:8px;"></div>` +
    articles.map((a) => articleBlock(a, L)).join('') +
    `<div style="border-top:1px solid ${P.line};height:18px;"></div>` +
    t.digestOutro.map((p) => para(esc(p))).join('');

  const textParts = [...t.digestIntro, ''];
  for (const a of articles) {
    const bullets = (a.summary && (a.summary[L] || a.summary.en)) || [];
    textParts.push(`${a.title}`, `${[a.source, a.date].filter(Boolean).join(' · ')}`, ...bullets.map((b) => `  - ${b}`), `  ${a.url}`, '');
  }
  textParts.push(...t.digestOutro, '', t.signoff, t.signature, t.signatureRole, '', `${t.unsubscribe}: ${unsubscribeUrl}`);

  return {
    subject: t.digestSubject(dateLabel),
    html: layout({ lang: L, preheader: t.digestPre(articles.length), body, unsubscribeUrl, siteUrl }),
    text: textParts.join('\n'),
  };
}
