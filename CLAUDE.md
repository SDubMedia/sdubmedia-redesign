# SDub Media Website — Project Context

## What This Is
Corporate marketing site for SDub Media (sdubmedia.com), a Nashville video production company.
Also contains a Hermes-powered autonomous blog + SEO content engine.

## What SDub Media Does
Recurring video content for businesses (weekly series, podcasts, corporate events, headshots).
Limited weddings and portraits — about 8 per year.

## Target Clients
Nashville-area businesses that need to show up on video every week.
Real estate teams, corporate brands, schools, professional services.
Think: Coldwell Banker Southern Realty, Webb School, Elite Dance.

## SEO Goal
Rank for Nashville corporate video keywords. Compete with tonefilms.com.
Build topical authority around "Nashville video production."

## Site Structure
Pages are Astro, in `src/pages/` (the root-level `*.html` files are dead pre-Astro leftovers):
- `index.astro` — Homepage
- `business.astro` — Corporate/brand video services
- `weddings.astro` — Wedding + portrait
- `senior-portraits.astro` — Senior sessions (split out of the weddings Portraits block, Aug 2026).
  Images are one real session published anonymously: filenames describe the frame, never the client,
  EXIF stripped on save, no name in copy or alt text. The frames were NOT shot in Nashville and the
  page never implies they were. Price is real and published ($750 flat, confirmed 2026-08-07):
  keep it accurate or remove it, never invent one
- `portfolio.astro` — Work showcase
- `about.astro` — About page
- `contact.astro` — Contact (posts to `api/contact.js`, a Vercel function using Resend)
- `blog/index.astro` + `blog/[slug].astro` — Blog index and post template

## Password-gated client proposals (`/studio/:deck`)

Private decks Geoff sends a client with a password. Added Aug 2026 for CBSR.

**They are NOT Astro pages, and must not become them.** This site builds to static
HTML, so anything under `src/pages/` is a real file Vercel serves to whoever guesses the
URL. A gate on top of a static file is theatre. Instead:

- `api/studio.js` is the only way in. It checks the password, sets a signed cookie, and
  returns the document. `noindex` + `no-store` on every response.
- The document lives in `api/_studio/<name>.js`. Vercel does not route files in `api/`
  that start with an underscore, so it has no URL of its own.
- The cookie is an HMAC of the deck slug **and its current password**, so rotating a
  password actually locks people out. Comparisons use `timingSafeEqual`.
- Images are inlined as data URIs. Anything in `public/` would be fetchable with no gate.
- `/studio` is not an Astro page, so it cannot reach the sitemap. Keep it that way.

**Adding a deck:** write `api/_studio/<name>.js` exporting an html function, add it to
`DECKS` in `api/studio.js` with its own password env var, add the rewrite in `vercel.json`,
then set the env var in Vercel. Never reuse one password across clients.

**Env:** `<NAME>_STUDIO_PASSWORD` per deck, plus one shared `STUDIO_COOKIE_SECRET`.
Production is set; the CLI errors on `preview`, so preview deploys show "not configured yet".

## Content Engine — state as of 2026-08-13
- The Hermes "Weekly Blog Writer" cron job (Mondays 9:00, Telegram delivery) is ENABLED.
  The "Blog Image Generator" job is PERMANENTLY paused: AI headers are retired.
- Headers: a post uses a REAL photo from public/images/ that no other post uses, or ships
  with none. If nothing fits, the writer asks Geoff for a photo via Telegram and the post
  waits for it. Never reuse another post's header (the index shows all cards at once).
- Keyword state: quick-wins.md is fully written out. target-keywords.md is mostly word-order
  duplicates plus stale statuses; the writer verifies against `grep -h '^keyword:'
  src/content/blog/*.md` and skips duplicate intents rather than trusting the tracker.
- The paperclipai cron jobs that used to run at 6am were an abandoned trial, removed
  2026-08-13 (data still at ~/.paperclip). Not related to Hermes.

## Content Engine
- `content/context/` — Read this before writing ANYTHING. Brand voice, style guide, examples.
- `content/drafts/` — Write posts here. Do not publish directly.
- `content/published/` — Approved posts only.
- `research/` — SEMrush keyword data, competitor analysis, topical map. Use to pick topics.

## Writing Rules
- Read `content/context/brand-voice.md` and `content/context/style-guide.md` first.
- NO EM-DASHES anywhere — blog posts, page copy, AND template strings (titles, meta). Use a colon+space, period, commas, or parentheses. Title tags use " | " as the brand separator. This is a hard rule across the whole site, not just blog content.
- **Page headings (h1/h2) are SENTENCE case.** Changed 2026-07-29: the rule used to say Title Case, but four of seven pages had always been sentence case, including the homepage and both main service pages, so the rule was losing. Everything is now normalised to sentence case, which also reads warmer. Capitalise only the first word plus proper nouns.
- **Exception: tile/card h3 labels stay Title Case** ("Recurring Content", "Podcast Production", "Recital and Performance Films"). They act as short labels, not sentences.
- **Blog post titles keep Title Case** (they are titles, not page headings).
- Blog posts: 1,500+ words minimum.
- Pillar pages: 2,500+ words minimum.
- No AI-isms: no "leverage", "utilize", "delve", "game-changing".
- Vary sentence length — no four-bullet-point monotony.
- One target keyword per post. Use it naturally, don't stuff.

## Keyword Selection for Blog Posts
1. Open `research/keywords/quick-wins.md` — pick the first keyword marked "Not written".
2. If quick wins are exhausted, use `research/keywords/target-keywords.md`.
3. Check `research/topical-map/supporting-posts.md` for the right cluster.
4. Mark keyword as "Written: YYYY-MM-DD" after the post is saved to drafts.

### GOTCHA: the two keyword files overlap, and "Not written" lies
`quick-wins.md` and `target-keywords.md` list many of the SAME keywords. Marking one file does not
mark the other, so `target-keywords.md` still shows "Not written" for 14 keywords that already have
a published post. **Before writing anything, check the keyword against the actual posts:**
`grep -h '^keyword:' src/content/blog/*.md` is the source of truth, not the tracker.

### Do NOT write a post per keyword permutation
Most of what remains in `target-keywords.md` is word-order variants of one query ("video production
nashville" / "nashville video production" / "video production in nashville" / "video production
nashville tennessee"). Google reads these as the same intent. A separate post for each is keyword
cannibalization: the pages compete with each other, split internal link equity, and look like
doorway pages. One post per INTENT, with the variants used naturally in the body. Only write a new
post when the searcher actually wants something different (e.g. "video production studios" is a
distinct intent: they want a physical studio space).

## Tech Stack
- Astro v6 (static output) — migrated from plain HTML on 2026-05-24
- Hosted on Vercel, GitHub repo `SDubMedia/sdubmedia-redesign` → auto-deploys on push to `main`
- Pages live in `src/pages/*.astro`; shared shell in `src/layouts/Layout.astro` (all CSS inlined there)
- Blog posts are a content collection: `src/content/blog/*.md`, schema in `src/content.config.ts`
- Blog images: gpt-image-1 (high quality, 1536x1024) via OpenAI API → `public/images/blog/` (dall-e-3 is NOT available on this key)
- SEO keyword data: SEMrush (research/ folder)
- Autonomous content: Hermes agents (cron jobs, Telegram approval workflow)

## Go-Live Status — LIVE
This Astro site IS the live sdubmedia.com (verified 2026-07-28: served by Vercel, `x-vercel-cache`
present, homepage + /blog/ both 200). The old Pixieset site has been replaced. Treat every push to
`main` as a production deploy to a public site.

Done:
- [x] Homepage real media (hero stills, service tiles, door images).
- [x] robots.txt pointing at the sitemap.
- [x] DNS pointed at Vercel; Pixieset retired.

Still open:
- [ ] Portfolio is mostly placeholders: 1 real Vimeo video, the rest render "Coming soon" tiles.
      Same on business.astro (2 of 3 empty) and weddings.astro (2 of 3 empty).
- [x] Blog headers: all 20 posts now use REAL photographs from public/images/ (2026-08-01),
      matched by subject and all distinct (the index shows every card on one page). Do NOT
      generate new gpt-image-1 art for posts; AI headers next to real work read as fake and
      were removed for that reason. New posts should reuse a real image or ship with none.
      The old AI files remain in public/images/blog/ only so cached social previews resolve.

## Editing Portfolio Videos and Client Logos
- Video lists are hardcoded arrays at the top of `portfolio.astro`, `business.astro`, `weddings.astro`.
- Homepage client strip reads `src/data/clients.json` (`{name, logo}`); an empty `logo` falls back to
  the client's name as text. Logo image files do not exist yet.
- There is deliberately NO admin login. Decided 2026-07-28: for the real cadence (a handful of videos
  a year) Geoff sends the Vimeo link or logo file and Claude edits + pushes. Revisit only if the
  cadence rises; the upgrade path is `videos.json` + a Kevin/Telegram commit hook, not a CMS.
- `VideoGrid.astro` fetches Vimeo thumbnails at BUILD time via public oEmbed (no API key). Any move
  to runtime data must preserve or cache those thumbnails.

## Build / Publish Workflow
- Hermes writes drafts to `content/drafts/` with `draft: true` frontmatter (Astro ignores them there).
- On approval (reply PUBLISH in Telegram), `scripts/publish-latest.sh` runs:
  flips `draft: false`, copies to `src/content/blog/`, archives original to `content/published/`,
  runs a verification build, then commits + pushes. Vercel deploys on push.
- Old root-level `*.html` files (index.html, about.html, etc.) are dead leftovers from the
  pre-Astro site. Astro does not serve them. Safe to delete; kept for reference only.

## Pillar / Cluster Interlinking + SEO-Safe Updates
- Posts are grouped by a `cluster` slug in frontmatter. One post per cluster has `isPillar: true`
  (the hub); the rest are cluster posts. The blog template auto-generates the links: cluster posts
  link UP to the pillar, the pillar lists its clusters ("More in This Series"). No hand-written links.
- Cluster posts ALSO get one contextual in-body link to the pillar (the pillar exists when they're
  written). The agent writes that sentence.
- To add contextual in-body links FROM a pillar TO its clusters, the pillar must be UPDATED after
  the cluster exists. That is fine and good for SEO — see the rule below.
- **NEVER rename a post file or change its slug/URL once published.** The URL is the filename.
  Changing it makes Google treat it as a brand-new page and throws away the ranking history.
- **When refreshing a pillar (or any post): keep `pubDate` and the filename exactly as-is, and set
  `updatedDate` to today.** Same URL + stable pubDate + newer updatedDate = Google sees a freshened
  page (a ranking positive), NOT a new post. The page emits BlogPosting JSON-LD with datePublished
  and dateModified to make this explicit, and shows "Updated <date>" in the byline.
- Redeploying via Vercel never creates a new post — it serves updated HTML at the same URL. Safe.

## GOTCHA: Astro content data store
- The content-layer cache lives in `node_modules/.astro/data-store.json` — NOT the project-root
  `.astro/` (that's just generated types). Deleting `.astro/` alone does NOT clear it.
- Stale entries persist there, especially for DELETED posts — a removed `.md` can keep rebuilding
  locally even though the source is gone. Clear with `rm -rf node_modules/.astro` then rebuild.
- This only affects LOCAL builds. Vercel does a fresh `npm install` so production always builds
  clean from the repo. `publish-latest.sh` clears it before verifying, so local mirrors Vercel.

## Layout Rules Learned the Hard Way (Aug 2026)
- **Never nest an `<a>` inside a `.tile` or `.door` link.** The whole card is an anchor;
  browsers auto-close the outer anchor at the inner one and the card's text falls out of
  the tile (this shipped broken on the homepage weddings card). Mention other pages as
  plain text inside cards, or put the link outside the card.
- **Page h1s: no forced `<br>`.** They wrap mid-phrase at in-between widths. Use
  `style="text-wrap: balance;"` and let the browser break lines (applied site-wide).
- **/weddings photo strip: the section heading states the number of weddings.** If you
  add or remove an image, update the count in the h2 in the same commit.
- **Tile images:** `.tile-image` is a fixed 180px crop for three-up tiles; `.tiles--two`
  overrides it to `aspect-ratio: 16/10` because double-wide cards letterbox people shots.
  People photos in cards carry `object-position` (top / center 25%) so faces survive
  whatever crop remains. Check faces at both mobile and full desktop width when adding
  card images.

## Self-Hosted Video (R2) — Aug 2026

Migrating off Vimeo. Videos live in the Cloudflare R2 bucket `sdubmedia-videos`,
served from the r2.dev public URL in `src/lib/video-manifest.mjs` (creds in
`.env.local`, gitignored — this repo is PUBLIC, never commit them).

- `src/data/videos.json` maps a key to its R2 files. Key = the video's Vimeo id
  (pages keep their ids; presence in the manifest flips that card/player from the
  Vimeo embed to the native <video>), or a plain slug for videos that never had a
  Vimeo id (`VideoGrid` items use `video: 'slug'` instead of `vimeo`).
- Add a video: `node scripts/encode-upload.mjs <source> <key> <slug> "<title>"`
  (compress + poster + upload + manifest entry), then commit videos.json.
- **Camera .mov files carry a timecode/data track; Chrome silently refuses the
  whole mp4 if it's copied through** (readyState stays 0, no error). The script
  maps only `0:v:0` + `0:a:0?` — keep it that way.
- **R2 objects are served with `Cache-Control: immutable` (1 year).** Re-uploading
  the same key can serve the OLD bytes from Cloudflare's edge or a visitor's
  browser cache indefinitely. If a video's content changes, use a NEW slug, don't
  overwrite.
- The Claude-in-Chrome automation browser cannot play ANY <video> media (even
  MDN's reference mp4 stalls at readyState 0). Do not burn time "debugging"
  playback there: verify files with `ffmpeg -i <url> -f null -` and have Geoff
  tap the card in a real browser.
- **Geoff edits thumbnails himself with `npm run posters`** (scripts/poster-picker.mjs,
  http://localhost:4820): scrub to a frame → one button extracts, uploads a fresh
  immutable poster key, updates videos.json, commits, pushes. Local-only on purpose —
  it needs the R2 creds and the site keeps its no-admin-login rule.
