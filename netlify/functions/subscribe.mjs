// POST /.netlify/functions/subscribe   body: { email, lang: "en"|"fr", "bot-field": "" }
// Adds the address to the Resend segment for that language and sends the welcome email.
// The site's form falls back to Netlify Forms if this returns an error, so nothing is lost
// while Resend is not configured yet.

import {
  config, isConfigured, resend,
  normEmail, normLang, validEmail,
  subscribeContact, unsubLink, welcomeEmail,
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
    console.warn('subscribe: Resend not configured (RESEND_API_KEY / RESEND_SEGMENT_EN / RESEND_SEGMENT_FR)');
    return json({ error: 'mailing list not configured' }, 503);
  }

  let outcome;
  try {
    outcome = await subscribeContact(c, email, lang);
  } catch (err) {
    console.error('subscribe: could not add contact', err.message);
    return json({ error: 'could not subscribe' }, 502);
  }

  // Heads-up to Franck. Best effort: never blocks the subscription.
  if (c.notifyTo) {
    try {
      const when = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne', dateStyle: 'medium', timeStyle: 'short' });
      const label = outcome === 'reactivated' ? 'Returning subscriber' : 'New subscriber';
      await resend(c, 'POST', '/emails', {
        from: c.from,
        to: [c.notifyTo],
        subject: `${label} (${lang.toUpperCase()}): ${email}`,
        text: `${label} on the Insights list.\n\nEmail: ${email}\nLanguage: ${lang}\nWhen: ${when} (Melbourne)\n\nFull list: https://resend.com/audience`,
      });
    } catch (err) {
      console.error('subscribe: owner notification failed', err.message);
    }
  }

  // The welcome note is a courtesy: if it fails the subscription still stands.
  try {
    const link = unsubLink(c, email, lang);
    const mail = welcomeEmail({ lang, unsubscribeUrl: link, siteUrl: c.siteUrl });
    await resend(c, 'POST', '/emails', {
      from: c.from,
      to: [email],
      reply_to: c.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: { 'List-Unsubscribe': `<${link}>` },
    });
  } catch (err) {
    console.error('subscribe: welcome email failed', err.message);
  }

  return json({ ok: true, lang });
};
