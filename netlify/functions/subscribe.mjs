// POST /.netlify/functions/subscribe   body: { email, lang: "en"|"fr", "bot-field": "" }
// Adds the address to the Resend audience for that language and sends the welcome email.
// The site's form falls back to Netlify Forms if this returns an error, so nothing is lost
// while Resend is not configured yet.

import {
  config, isConfigured, resend,
  normEmail, normLang, validEmail,
  unsubLink, welcomeEmail,
} from '../lib/mail.mjs';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let body = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'expected a JSON body' }, 400);
  }

  // Honeypot filled in -> a bot. Pretend it worked and do nothing.
  if (body['bot-field']) return json({ ok: true });

  const email = normEmail(body.email);
  const lang = normLang(body.lang);
  if (!validEmail(email)) return json({ error: 'invalid email' }, 400);

  const c = config();
  if (!isConfigured(c)) {
    console.warn('subscribe: Resend not configured (RESEND_API_KEY / RESEND_AUDIENCE_EN / RESEND_AUDIENCE_FR)');
    return json({ error: 'mailing list not configured' }, 503);
  }

  const audience = c.audiences[lang];
  try {
    await addOrReactivate(c, audience, email);
  } catch (err) {
    console.error('subscribe: could not add contact', err.message);
    return json({ error: 'could not subscribe' }, 502);
  }

  // The welcome note is a courtesy: if it fails the subscription still stands.
  try {
    const mail = welcomeEmail({ lang, unsubscribeUrl: unsubLink(c, email, lang), siteUrl: c.siteUrl });
    await resend(c, 'POST', '/emails', {
      from: c.from,
      to: [email],
      reply_to: c.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: { 'List-Unsubscribe': `<${unsubLink(c, email, lang)}>` },
    });
  } catch (err) {
    console.error('subscribe: welcome email failed', err.message);
  }

  return json({ ok: true, lang });
};

async function addOrReactivate(c, audience, email) {
  try {
    await resend(c, 'POST', `/audiences/${audience}/contacts`, { email, unsubscribed: false });
    return;
  } catch (err) {
    // Already in the audience (possibly unsubscribed earlier): flip it back on.
    const msg = String(err.message || '').toLowerCase();
    if (err.status === 409 || msg.includes('already') || msg.includes('exists')) {
      await resend(c, 'PATCH', `/audiences/${audience}/contacts/${encodeURIComponent(email)}`, { unsubscribed: false });
      return;
    }
    throw err;
  }
}
