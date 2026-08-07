// ============================================================
// Password gate for client proposals. Serves the document ONLY after the
// password checks out.
//
// Why a function and not an Astro page: this site builds to static HTML, so any
// page under src/pages/ ends up as a real file that Vercel serves to anyone who
// knows the URL. A gate rendered on top of a static file is theatre, not a lock.
// The document here never exists as a file. It is a string inside a module in
// api/_studio/, which Vercel does not route (leading underscore), and the only
// way to get it is through this handler.
//
// The cookie is an HMAC of the deck slug and its current password, so it cannot
// be forged without the secret, cannot be replayed against a different deck,
// and stops working the moment the password is rotated. Comparison is
// timing-safe: === on a secret leaks its prefix one byte at a time.
//
// ENV (Vercel project settings):
//   CBSR_STUDIO_PASSWORD   the password given to the client
//   STUDIO_COOKIE_SECRET   any long random string, used to sign the cookie
//
// Adding another client deck later: write api/_studio/<name>.js exporting an
// html() function, add it to DECKS below with its own password env var, and
// add the rewrite in vercel.json. Do not reuse one password across clients.
// ============================================================

import { createHmac, timingSafeEqual } from 'crypto';
import { proposalHtml } from './_studio/proposal.js';

const DECKS = {
  cbsr: {
    title: 'CBSR Content Studio',
    client: 'Coldwell Banker Southern Realty',
    passwordEnv: 'CBSR_STUDIO_PASSWORD',
    render: proposalHtml,
  },
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days: the client should not have to re-enter it every visit.

// The password is folded into the token, so rotating a deck's password also
// invalidates every session already unlocked with the old one. Keying on the
// slug alone meant "I changed the password" quietly did nothing to anyone who
// was already in.
function tokenFor(slug, password) {
  const secret = process.env.STUDIO_COOKIE_SECRET || '';
  return createHmac('sha256', secret).update(`deck:${slug}:${password}`).digest('hex');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  // timingSafeEqual throws on a length mismatch, which would itself leak length.
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return '';
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function gateHtml(deck, slug, { error } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow, noarchive" />
<title>${esc(deck.title)} &middot; SDub Media</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0d0d0f; color: #eceae6; padding: 28px;
    font-family: ui-sans-serif, -apple-system, "Segoe UI", Inter, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .box { width: 100%; max-width: 400px; }
  .eyebrow { font-size: 0.68rem; letter-spacing: 0.24em; text-transform: uppercase; color: #c8862a; font-weight: 600; }
  h1 { font-size: 1.6rem; font-weight: 600; letter-spacing: -0.02em; margin: 1rem 0 0.5rem; line-height: 1.2; }
  p { color: #9b978f; font-size: 0.94rem; line-height: 1.6; margin: 0 0 1.9rem; }
  label { display: block; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: #9b978f; margin-bottom: 0.55rem; }
  input {
    width: 100%; padding: 0.85rem 1rem; font-size: 1rem; color: #eceae6;
    background: #141418; border: 1px solid rgba(255,255,255,0.16); border-radius: 10px; outline: none;
    font-family: inherit;
  }
  input:focus { border-color: #c8862a; }
  button {
    width: 100%; margin-top: 0.9rem; padding: 0.85rem 1rem; font-size: 0.95rem; font-weight: 600;
    color: #0d0d0f; background: #c8862a; border: 0; border-radius: 10px; cursor: pointer; font-family: inherit;
  }
  button:hover { background: #d9963a; }
  .err { color: #e2907f; font-size: 0.88rem; margin: 1rem 0 0; }
  .foot { margin-top: 2.6rem; font-size: 0.8rem; color: #57544f; }
</style>
</head>
<body>
  <div class="box">
    <span class="eyebrow">SDub Media</span>
    <h1>${esc(deck.title)}</h1>
    <p>Prepared for ${esc(deck.client)}. Enter the password included with your invitation.</p>
    <form method="POST" action="/studio/${esc(slug)}">
      <label for="pw">Password</label>
      <input id="pw" name="password" type="password" autocomplete="current-password" autofocus required />
      <button type="submit">View proposal</button>
      ${error ? `<p class="err">${esc(error)}</p>` : ''}
    </form>
    <p class="foot">Trouble getting in? Email geoff@sdubmedia.com</p>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  const slug = String(req.query.deck || 'cbsr').toLowerCase();
  const deck = DECKS[slug];

  // Never let a client deck be indexed or cached by anything in between.
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!deck) return res.status(404).send('Not found');

  const expected = process.env[deck.passwordEnv];
  if (!expected || !process.env.STUDIO_COOKIE_SECRET) {
    console.error(`studio: ${deck.passwordEnv} or STUDIO_COOKIE_SECRET is not set`);
    return res.status(500).send('This proposal is not configured yet.');
  }

  const cookieName = `studio_${slug}`;

  // Already unlocked on this device.
  if (safeEqual(readCookie(req, cookieName), tokenFor(slug, expected))) {
    return res.status(200).send(deck.render());
  }

  if (req.method === 'POST') {
    // Vercel parses JSON and urlencoded bodies; the gate form posts urlencoded.
    const body = req.body || {};
    const supplied = typeof body === 'string' ? new URLSearchParams(body).get('password') : body.password;
    if (supplied && safeEqual(supplied, expected)) {
      res.setHeader('Set-Cookie',
        `${cookieName}=${tokenFor(slug, expected)}; Path=/studio; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`);
      return res.status(200).send(deck.render());
    }
    return res.status(401).send(gateHtml(deck, slug, { error: 'That password did not work. Check the invitation, or email geoff@sdubmedia.com.' }));
  }

  return res.status(200).send(gateHtml(deck, slug));
}
