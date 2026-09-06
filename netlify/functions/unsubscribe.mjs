// GET /.netlify/functions/unsubscribe?e=<email>&l=<en|fr>&t=<signature>
// Signed link placed in the welcome email. Marks the contact unsubscribed in Resend and
// shows a small confirmation page. (The weekly digest itself uses Resend's own
// per-recipient unsubscribe link, which flips the same global flag on the contact.)

import { config, isConfigured, normEmail, normLang, validEmail, tokenOk, unsubscribeContact } from '../lib/mail.mjs';

const PAGES = {
  en: {
    okTitle: 'You’re unsubscribed',
    okBody: (e) => `${e} will not receive the Insights brief any more. Thanks for having read along, and you are welcome back any time.`,
    badTitle: 'This link is not valid',
    badBody: 'The unsubscribe link looks incomplete or has been altered. Reply to any brief with “unsubscribe” and I will remove you by hand.',
    errTitle: 'Something went wrong',
    errBody: 'I could not update your subscription right now. Reply to any brief with “unsubscribe” and I will remove you by hand.',
    back: 'Back to the site',
  },
  fr: {
    okTitle: 'Vous êtes désabonné·e',
    okBody: (e) => `${e} ne recevra plus la synthèse Insights. Merci de m’avoir lu, et vous serez toujours le·la bienvenu·e.`,
    badTitle: 'Ce lien n’est pas valide',
    badBody: 'Le lien de désabonnement semble incomplet ou modifié. Répondez à n’importe quelle synthèse avec « désabonnement » et je vous retirerai manuellement.',
    errTitle: 'Une erreur est survenue',
    errBody: 'Impossible de mettre à jour votre abonnement pour le moment. Répondez à n’importe quelle synthèse avec « désabonnement » et je vous retirerai manuellement.',
    back: 'Retour au site',
  },
};

function page(lang, title, body, siteUrl, status = 200) {
  const t = PAGES[lang];
  const html = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${title} — Tujek Consulting</title>
<style>
  body{margin:0;background:#f6f7fb;font-family:'IBM Plex Sans',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f1e3d}
  .card{max-width:520px;margin:12vh auto;background:#fff;border:1px solid #e2e6ef;border-radius:14px;padding:38px 34px}
  .brand{font-family:Spectral,Georgia,serif;font-size:20px;margin:0 0 26px}.brand span{color:#3b6fd4}
  h1{font-family:Spectral,Georgia,serif;font-weight:500;font-size:26px;margin:0 0 12px}
  p{font-size:16px;line-height:1.6;margin:0 0 22px;color:#3d465a}
  a.btn{display:inline-block;background:#0f1e3d;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-size:14px;font-weight:600}
</style></head><body><div class="card"><p class="brand">Tujek <span>Consulting</span></p>
<h1>${title}</h1><p>${body}</p><a class="btn" href="${siteUrl}">${t.back}</a></div></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export default async (req) => {
  const url = new URL(req.url);
  const email = normEmail(url.searchParams.get('e'));
  const lang = normLang(url.searchParams.get('l'));
  const token = url.searchParams.get('t') || '';
  const c = config();
  const t = PAGES[lang];

  if (!validEmail(email) || !c.unsubSecret || !tokenOk(c, email, lang, token)) {
    return page(lang, t.badTitle, t.badBody, c.siteUrl, 400);
  }
  if (!isConfigured(c)) {
    return page(lang, t.errTitle, t.errBody, c.siteUrl, 503);
  }

  // Global opt-out on the contact: covers both language segments at once.
  try {
    await unsubscribeContact(c, email);
  } catch (err) {
    // 404 = not a contact any more, which is the same outcome.
    if (err.status !== 404) {
      console.error('unsubscribe: failed', err.message);
      return page(lang, t.errTitle, t.errBody, c.siteUrl, 502);
    }
  }

  return page(lang, t.okTitle, t.okBody(email), c.siteUrl);
};
