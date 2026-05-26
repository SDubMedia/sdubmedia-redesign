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
- `index.html` — Homepage
- `business.html` — Corporate/brand video services
- `weddings.html` — Wedding + portrait
- `portfolio.html` — Work showcase
- `about.html` — About page
- `contact.html` — Contact

## Content Engine
- `content/context/` — Read this before writing ANYTHING. Brand voice, style guide, examples.
- `content/drafts/` — Write posts here. Do not publish directly.
- `content/published/` — Approved posts only.
- `research/` — SEMrush keyword data, competitor analysis, topical map. Use to pick topics.

## Writing Rules
- Read `content/context/brand-voice.md` and `content/context/style-guide.md` first.
- NO EM-DASHES anywhere — blog posts, page copy, AND template strings (titles, meta). Use a colon+space, period, commas, or parentheses. Title tags use " | " as the brand separator. This is a hard rule across the whole site, not just blog content.
- All headings/titles in Title Case (small words like a/the/of/to/in lowercase unless first).
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

## Tech Stack
- Astro v6 (static output) — migrated from plain HTML on 2026-05-24
- Hosted on Vercel, GitHub repo `SDubMedia/sdubmedia-redesign` → auto-deploys on push to `main`
- Pages live in `src/pages/*.astro`; shared shell in `src/layouts/Layout.astro` (all CSS inlined there)
- Blog posts are a content collection: `src/content/blog/*.md`, schema in `src/content.config.ts`
- Blog images: gpt-image-1 (high quality, 1536x1024) via OpenAI API → `public/images/blog/` (dall-e-3 is NOT available on this key)
- SEO keyword data: SEMrush (research/ folder)
- Autonomous content: Hermes agents (cron jobs, Telegram approval workflow)

## Go-Live Status — NOT LIVE YET
The real sdubmedia.com is still the old Pixieset site. This Astro site lives ONLY on the Vercel
preview URL (sdubmedia-redesign.vercel.app). Before pointing sdubmedia.com here:
- [ ] Replace homepage placeholder boxes with REAL media: hero stills (business + weddings), the 3 service tiles (recurring content / podcast / events+headshots), and the 2 door images. Geoff is gathering these (~late May 2026).
- [ ] Add real portfolio videos (YouTube embeds) — the portfolio page is currently empty ("Videos coming soon").
- [ ] Add robots.txt.
- [ ] Point sdubmedia.com DNS at Vercel: Claude adds the domain to the Vercel project + supplies the DNS records; GEOFF makes the DNS change at the registrar (location TBD). This REPLACES the Pixieset site, so confirm before flipping.

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
