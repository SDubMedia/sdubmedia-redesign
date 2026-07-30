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
- `portfolio.astro` — Work showcase
- `about.astro` — About page
- `contact.astro` — Contact (posts to `api/contact.js`, a Vercel function using Resend)
- `blog/index.astro` + `blog/[slug].astro` — Blog index and post template

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
- [ ] 6 of 20 blog posts have no `image:` (they degrade fine, but no header art and no og:image).
      Generate with gpt-image-1 into `public/images/blog/<slug>.png`, then add the `image:` field.

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
