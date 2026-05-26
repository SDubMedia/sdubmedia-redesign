// Vercel serverless function: receives the contact form POST and emails Geoff via Resend.
// Requires the RESEND_API_KEY environment variable set in the Vercel project.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const { name, email, phone, planning, eventDateTime, message, company } = body;

  // Honeypot: real people leave "company" empty; bots fill every field. Silently accept and drop.
  if (company) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email) {
    return res.status(400).json({ error: 'Please include your name and email.' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('contact: RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'The contact form is not configured yet.' });
  }

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone],
    ['Planning', planning],
    ['Event date & time', eventDateTime],
    ['Details', message],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${k}</td><td style="padding:6px 12px">${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('');

  const html = `<h2 style="font-family:sans-serif">New inquiry from sdubmedia.com</h2>
  <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">${rows}</table>
  <p style="font-family:sans-serif;color:#888;font-size:13px">Reply directly to this email to reach ${esc(name)}.</p>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // TODO: change to a verified address (e.g. hello@sdubmedia.com) once the domain is verified in Resend.
        from: 'SDub Media Site <onboarding@resend.dev>',
        to: ['geoff@sdubmedia.com'],
        reply_to: email,
        subject: `New inquiry from ${name}${planning ? ' — ' + planning : ''}`,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('contact: Resend returned', r.status, detail);
      return res.status(502).json({ error: 'Could not send right now. Please email geoff@sdubmedia.com directly.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact: send failed', err);
    return res.status(502).json({ error: 'Could not send right now. Please email geoff@sdubmedia.com directly.' });
  }
}
