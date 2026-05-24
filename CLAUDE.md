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
- Blog images: DALL-E 3 via OpenAI API → `public/images/blog/`
- SEO keyword data: SEMrush (research/ folder)
- Autonomous content: Hermes agents (cron jobs, Telegram approval workflow)

## Build / Publish Workflow
- Hermes writes drafts to `content/drafts/` with `draft: true` frontmatter (Astro ignores them there).
- On approval (reply PUBLISH in Telegram), `scripts/publish-latest.sh` runs:
  flips `draft: false`, copies to `src/content/blog/`, archives original to `content/published/`,
  runs a verification build, then commits + pushes. Vercel deploys on push.
- Old root-level `*.html` files (index.html, about.html, etc.) are dead leftovers from the
  pre-Astro site. Astro does not serve them. Safe to delete; kept for reference only.

## GOTCHA: Astro content data store
- The content-layer cache lives in `node_modules/.astro/data-store.json` — NOT the project-root
  `.astro/` (that's just generated types). Deleting `.astro/` alone does NOT clear it.
- Stale entries persist there, especially for DELETED posts — a removed `.md` can keep rebuilding
  locally even though the source is gone. Clear with `rm -rf node_modules/.astro` then rebuild.
- This only affects LOCAL builds. Vercel does a fresh `npm install` so production always builds
  clean from the repo. `publish-latest.sh` clears it before verifying, so local mirrors Vercel.
