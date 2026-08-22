// Local poster-picker for the self-hosted videos (Geoff-editable thumbnails).
//
// Run `npm run posters`, open http://localhost:4820, scrub any film to the
// frame you like, press "Use this frame". The server then:
//   1. extracts that frame from the video's R2 copy with ffmpeg,
//   2. uploads it to the sdubmedia-videos bucket under a NEW key
//      (<slug>-p<timestamp>.jpg — R2 serves immutable, keys are never reused),
//   3. points src/data/videos.json at it,
//   4. commits and pushes, which redeploys the site.
//
// Local-only on purpose: the site has no admin login by design (decided
// 2026-07-28), and this needs the R2 creds from .env.local, which never
// leave this machine.

import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, statSync } from 'fs';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(root, 'src/data/videos.json');
const VIDEO_BASE = 'https://pub-de3d1d03d535464c8c62813429a5a9ab.r2.dev';
const PORT = 4820;

const env = {};
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
for (const k of ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_S3_ENDPOINT', 'R2_BUCKET']) {
  if (!env[k]) { console.error(`Missing ${k} in .env.local`); process.exit(1); }
}

function page() {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const cards = Object.entries(manifest).map(([key, v]) => `
    <div class="card" data-key="${key}">
      <h2>${v.title}</h2>
      <div class="pair">
        <div>
          <p class="hint">Scrub to the frame you want, then press the button.</p>
          <video controls preload="metadata" playsinline src="${VIDEO_BASE}/${v.file}"></video>
        </div>
        <div>
          <p class="hint">Current thumbnail</p>
          <img src="${VIDEO_BASE}/${v.poster}" alt="current poster" />
        </div>
      </div>
      <button onclick="setPoster(this, '${key}')">Use this frame as the thumbnail</button>
      <p class="status"></p>
    </div>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><title>Poster picker</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem 1rem; }
    h1 { text-align: center; font-weight: 600; }
    .card { max-width: 56rem; margin: 0 auto 2.5rem; background: #1e293b; border-radius: 12px; padding: 1.25rem; }
    .card h2 { margin: 0 0 0.75rem; font-size: 1.05rem; }
    .pair { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: start; }
    @media (max-width: 640px) { .pair { grid-template-columns: 1fr; } }
    video, img { width: 100%; max-height: 420px; object-fit: contain; background: #000; border-radius: 8px; }
    .hint { font-size: 0.75rem; color: #94a3b8; margin: 0 0 0.4rem; }
    button { margin-top: 0.9rem; width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 600; color: #fff; background: #2563eb; border: 0; border-radius: 8px; cursor: pointer; }
    button:disabled { opacity: 0.5; }
    .status { font-size: 0.85rem; color: #94a3b8; min-height: 1.2em; }
    .status.ok { color: #34d399; }
    .status.err { color: #f87171; }
  </style></head><body>
  <h1>Video thumbnails</h1>
  <p style="text-align:center;color:#94a3b8;font-size:0.85rem;">Changes upload, commit, and redeploy the site on their own — allow a couple of minutes to go live.</p>
  ${cards}
  <script>
    async function setPoster(btn, key) {
      const card = btn.closest('.card');
      const video = card.querySelector('video');
      const status = card.querySelector('.status');
      const t = video.currentTime;
      btn.disabled = true;
      status.className = 'status';
      status.textContent = 'Grabbing frame at ' + t.toFixed(1) + 's, uploading…';
      try {
        const r = await fetch('/set', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, time: t }) });
        const b = await r.json();
        if (!r.ok) throw new Error(b.error || 'failed');
        card.querySelector('img').src = '${VIDEO_BASE}/' + b.poster + '?t=' + Date.now();
        status.className = 'status ok';
        status.textContent = 'Done — new thumbnail is deploying (live in ~2 min).';
      } catch (e) {
        status.className = 'status err';
        status.textContent = 'Failed: ' + e.message;
      } finally {
        btn.disabled = false;
      }
    }
  </script></body></html>`;
}

function setPoster(key, time) {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const entry = manifest[key];
  if (!entry) throw new Error(`Unknown video: ${key}`);
  const t = Math.max(0, Number(time) || 0);
  const posterKey = `${key.replace(/[^\w-]/g, '')}-p${Date.now()}.jpg`;

  const work = mkdtempSync(join(tmpdir(), 'poster-'));
  const out = join(work, posterKey);
  try {
    execFileSync('ffmpeg', [
      '-y', '-v', 'error', '-ss', String(t),
      '-i', `${VIDEO_BASE}/${entry.file}`,
      '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '3', out,
    ]);
    if (!statSync(out).size) throw new Error('Empty frame');
    execFileSync('curl', [
      '-sf', '-o', '/dev/null', '-X', 'PUT', '--data-binary', `@${out}`,
      '--aws-sigv4', 'aws:amz:auto:s3',
      '--user', `${env.R2_ACCESS_KEY_ID}:${env.R2_SECRET_ACCESS_KEY}`,
      '-H', 'Content-Type: image/jpeg',
      '-H', 'Cache-Control: public, max-age=31536000, immutable',
      `${env.R2_S3_ENDPOINT}/${env.R2_BUCKET}/${posterKey}`,
    ]);
    entry.poster = posterKey;
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
    execFileSync('git', ['add', 'src/data/videos.json'], { cwd: root });
    execFileSync('git', ['commit', '-q', '-m', `chore(videos): ${key} thumbnail set to frame at ${t.toFixed(1)}s (poster picker)`], { cwd: root });
    execFileSync('git', ['push', 'origin', 'main'], { cwd: root });
    return posterKey;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(page());
    return;
  }
  if (req.method === 'POST' && req.url === '/set') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const { key, time } = JSON.parse(body || '{}');
        const poster = setPoster(key, time);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, poster }));
      } catch (e) {
        console.error(e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'failed' }));
      }
    });
    return;
  }
  res.writeHead(404); res.end('not found');
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Poster picker: http://localhost:${PORT}`);
});
