// Local gallery organizer for the hidden pitch pages (Geoff-editable order).
//
// Run `npm run family` (or `node scripts/gallery-order.mjs lifestyle`), open
// http://localhost:4821, drag the photos into the order you want, star one
// as the cover, hide any you don't want on the page, press Save. The server
// rewrites src/data/<gallery>-gallery.json in that order, commits and
// pushes, which redeploys the site. Nothing is deleted: a hidden photo stays
// in the manifest and the folder, it just isn't rendered.
//
// Local-only on purpose, same as poster-picker: the site has no admin login
// by design (decided 2026-07-28).

import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gallery = process.argv[2] || 'family';
const MANIFEST = join(root, `src/data/${gallery}-gallery.json`);
const IMG_DIR = join(root, `public/images/${gallery}`);
const PORT = 4821;
if (!existsSync(MANIFEST)) { console.error(`No manifest at ${MANIFEST}`); process.exit(1); }

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

function page() {
  const items = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const tiles = items.map((p, i) => `
    <li class="tile${p.hidden ? ' hidden' : ''}${p.cover ? ' cover' : ''}" draggable="true" data-file="${p.file}">
      <img src="/img/${p.file}" alt="" loading="lazy" />
      <span class="n">${i + 1}</span>
      <div class="tools">
        <button class="mv" data-dir="-1" title="Move earlier">&#8592;</button>
        <button class="star" title="Use as cover">&#9733;</button>
        <button class="eye" title="Show / hide on the page">&#128065;</button>
        <button class="mv" data-dir="1" title="Move later">&#8594;</button>
      </div>
    </li>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><title>Order: ${gallery}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 1rem; }
    header { position: sticky; top: 0; z-index: 5; background: #0f172a; padding: .75rem 0 1rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    h1 { font-size: 1.1rem; font-weight: 600; margin: 0; flex: 1 1 auto; }
    .hint { color: #94a3b8; font-size: .85rem; margin: 0; flex-basis: 100%; }
    button.save { background: #0088ff; color: #fff; border: 0; border-radius: 8px; padding: .6rem 1.1rem; font-size: .95rem; cursor: pointer; }
    button.save:disabled { opacity: .5; cursor: default; }
    #status { font-size: .9rem; color: #94a3b8; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
    .tile { position: relative; background: #1e293b; border-radius: 8px; overflow: hidden; aspect-ratio: 1; cursor: grab; border: 3px solid transparent; }
    .tile img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
    .tile.cover { border-color: #fbbf24; }
    .tile.hidden img { opacity: .25; }
    .tile.hidden::after { content: 'hidden'; position: absolute; inset: 0; display: grid; place-items: center; color: #f87171; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
    .tile.dragging { opacity: .4; }
    .tile.over { border-color: #0088ff; }
    .n { position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,.7); color: #fbbf24; font-size: .75rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .tools { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; background: linear-gradient(transparent, rgba(0,0,0,.75)); padding: 6px; }
    .tools button { background: rgba(255,255,255,.15); color: #fff; border: 0; border-radius: 6px; width: 30px; height: 30px; cursor: pointer; font-size: .95rem; }
    .tools button:hover { background: rgba(255,255,255,.35); }
    .tile.cover .star { background: #fbbf24; color: #000; }
  </style></head><body>
  <header>
    <h1>${gallery} page order &middot; ${items.length} photos</h1>
    <span id="status"></span>
    <button class="save" id="save">Save &amp; publish</button>
    <p class="hint">Drag to reorder (or use the arrows). &#9733; makes a photo the cover. &#128065; hides it from the page without deleting it. Save commits and pushes; the site updates in about a minute.</p>
  </header>
  <ul id="grid">${tiles}</ul>
  <script>
    const grid = document.getElementById('grid');
    const status = document.getElementById('status');
    let dirty = false;
    const mark = () => { dirty = true; renumber(); status.textContent = 'Unsaved changes'; };
    function renumber() { [...grid.children].forEach((t, i) => t.querySelector('.n').textContent = i + 1); }

    let dragging = null;
    grid.addEventListener('dragstart', e => { dragging = e.target.closest('.tile'); dragging.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    grid.addEventListener('dragend', () => { dragging?.classList.remove('dragging'); grid.querySelectorAll('.over').forEach(t => t.classList.remove('over')); dragging = null; });
    grid.addEventListener('dragover', e => {
      e.preventDefault();
      const t = e.target.closest('.tile'); if (!t || t === dragging) return;
      grid.querySelectorAll('.over').forEach(x => x.classList.remove('over')); t.classList.add('over');
    });
    grid.addEventListener('drop', e => {
      e.preventDefault();
      const t = e.target.closest('.tile'); if (!t || !dragging || t === dragging) return;
      const kids = [...grid.children];
      if (kids.indexOf(dragging) < kids.indexOf(t)) t.after(dragging); else t.before(dragging);
      mark();
    });
    grid.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const t = b.closest('.tile');
      if (b.classList.contains('mv')) {
        const dir = Number(b.dataset.dir);
        const sib = dir < 0 ? t.previousElementSibling : t.nextElementSibling;
        if (!sib) return;
        dir < 0 ? sib.before(t) : sib.after(t);
        t.scrollIntoView({ block: 'nearest' });
      } else if (b.classList.contains('star')) {
        grid.querySelectorAll('.cover').forEach(x => x.classList.remove('cover'));
        t.classList.add('cover'); t.classList.remove('hidden');
      } else if (b.classList.contains('eye')) {
        if (t.classList.contains('cover')) return;
        t.classList.toggle('hidden');
      }
      mark();
    });

    document.getElementById('save').onclick = async () => {
      const btn = document.getElementById('save'); btn.disabled = true; status.textContent = 'Saving and publishing…';
      const order = [...grid.children].map(t => ({ file: t.dataset.file, cover: t.classList.contains('cover'), hidden: t.classList.contains('hidden') }));
      try {
        const r = await fetch('/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'failed');
        dirty = false; status.textContent = 'Saved and pushed. Live in about a minute.';
      } catch (err) { status.textContent = 'Error: ' + err.message; }
      btn.disabled = false;
    };
    window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  </script></body></html>`;
}

function save(order) {
  const items = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const byFile = new Map(items.map(p => [p.file, p]));
  const next = [];
  for (const o of order) {
    const p = byFile.get(o.file);
    if (!p) throw new Error(`Unknown file ${o.file}`);
    const out = { file: p.file, width: p.width, height: p.height, alt: p.alt };
    if (o.cover) out.cover = true;
    if (o.hidden && !o.cover) out.hidden = true;
    next.push(out);
    byFile.delete(o.file);
  }
  // Anything the page didn't know about (added since it loaded) keeps its place at the end.
  for (const p of byFile.values()) next.push(p);
  if (!next.some(p => p.cover)) next[0].cover = true;
  writeFileSync(MANIFEST, JSON.stringify(next, null, 1) + '\n');
  const rel = `src/data/${gallery}-gallery.json`;
  execFileSync('git', ['add', rel], { cwd: root });
  execFileSync('git', ['commit', '-q', '-m', `chore(${gallery}): photo order set (gallery organizer)`], { cwd: root });
  execFileSync('git', ['push', 'origin', 'main'], { cwd: root });
}

createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(page());
    return;
  }
  if (req.method === 'GET' && req.url.startsWith('/img/')) {
    const name = decodeURIComponent(req.url.slice(5)).replace(/[^A-Za-z0-9._-]/g, '');
    const file = join(IMG_DIR, name);
    if (!name || !existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[extname(name).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(readFileSync(file));
    return;
  }
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        save(JSON.parse(body || '{}').order || []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
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
  console.log(`Gallery organizer (${gallery}): http://localhost:${PORT}`);
});
