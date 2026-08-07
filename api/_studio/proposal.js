// ============================================================
// CBSR Content Studio — the proposal document itself.
//
// Lives in api/_studio/ on purpose. Vercel ignores files and folders in api/
// that begin with an underscore, so nothing here becomes a public route. The
// document is only ever returned by api/studio.js, and only after the password
// check passes. If this were an Astro page it would build to a static file and
// be readable by anyone who guessed the URL, password or not.
//
// Everything is self-contained: inline CSS, inline SVG, and the render as a
// data URI. No external requests, so nothing about this proposal leaks to a
// CDN log or an image host.
//
// HONESTY RULES CARRIED OVER FROM THE SITE:
//   - No invented statistics. The "why" section uses things SDub has actually
//     done for CBSR (headshot days, the broker interview session) rather than
//     industry numbers nobody can source.
//   - No invented clients. CBSR is real; nobody else is named.
//   - Equipment prices are Geoff's to confirm. The client-facing document
//     deliberately does NOT itemise hardware cost: this is a managed program,
//     and line-iteming the gear invites "we will just buy it ourselves."
// ============================================================

import { ROOM_RENDER } from './render.js';

const ACCENT = '#c8862a';

export function proposalHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow, noarchive, noimageindex" />
<title>CBSR Content Studio &middot; SDub Media</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<style>
  :root {
    --ink: #0d0d0f;
    --ink-2: #141418;
    --line: rgba(255,255,255,0.10);
    --line-2: rgba(255,255,255,0.18);
    --text: #eceae6;
    --muted: #9b978f;
    --accent: ${ACCENT};
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    background: var(--ink);
    color: var(--text);
    font-family: ui-sans-serif, -apple-system, "Segoe UI", Inter, system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.62;
    -webkit-font-smoothing: antialiased;
  }
  img { max-width: 100%; display: block; }

  .wrap { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
  .narrow { max-width: 760px; margin: 0 auto; padding: 0 28px; }

  section { padding: 92px 0; border-top: 1px solid var(--line); }
  section:first-of-type { border-top: 0; }

  h1, h2, h3 { font-weight: 600; letter-spacing: -0.02em; line-height: 1.15; margin: 0; }
  h1 { font-size: clamp(2.4rem, 6vw, 4.2rem); }
  h2 { font-size: clamp(1.7rem, 3.4vw, 2.5rem); }
  h3 { font-size: 1.05rem; letter-spacing: 0.01em; }
  p { margin: 0 0 1.15em; }
  p:last-child { margin-bottom: 0; }
  a { color: var(--accent); }

  .label {
    font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--accent); font-weight: 600; display: block; margin-bottom: 1.1rem;
  }
  .lede { font-size: 1.18rem; color: #d8d5cf; }
  .muted { color: var(--muted); }
  .rule { height: 1px; background: var(--line); margin: 2.6rem 0; }

  /* ---- Cover ---- */
  .cover { position: relative; min-height: 92vh; display: flex; flex-direction: column; justify-content: flex-end; padding: 0; border-top: 0; }
  .cover-img { position: absolute; inset: 0; }
  .cover-img img { width: 100%; height: 100%; object-fit: cover; }
  .cover-img::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(13,13,15,0.78) 0%, rgba(13,13,15,0.34) 30%, rgba(13,13,15,0.80) 62%, rgba(13,13,15,0.97) 92%);
  }
  .cover-inner { position: relative; padding: 0 28px 76px; max-width: 1100px; margin: 0 auto; width: 100%; }
  .cover-top {
    position: absolute; top: 0; left: 0; right: 0; z-index: 2;
    padding: 34px 28px; display: flex; justify-content: space-between; align-items: center;
    font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.72);
  }
  .cover h1 { margin-bottom: 1.1rem; }
  .cover-sub { font-size: 1.15rem; color: #cfccc5; max-width: 46ch; }
  .cover-meta {
    margin-top: 2.6rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.22);
    display: flex; flex-wrap: wrap; gap: 2.6rem;
    font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.62);
  }
  .cover-meta strong { display: block; color: #fff; letter-spacing: 0.06em; font-weight: 600; margin-top: 0.35rem; text-transform: none; font-size: 0.95rem; }

  /* ---- Contents ---- */
  .toc { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0; border-top: 1px solid var(--line); }
  .toc a {
    display: flex; gap: 1rem; align-items: baseline; padding: 1.15rem 0.4rem;
    border-bottom: 1px solid var(--line); color: var(--text); text-decoration: none;
  }
  .toc a:hover { color: var(--accent); }
  .toc .n { color: var(--accent); font-size: 0.74rem; letter-spacing: 0.12em; font-variant-numeric: tabular-nums; }

  /* ---- Generic grids ---- */
  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2.4rem; }
  .card { border: 1px solid var(--line); border-radius: 14px; padding: 1.9rem; background: var(--ink-2); }
  .card h3 { margin-bottom: 0.6rem; }
  .card p { font-size: 0.95rem; color: var(--muted); margin: 0; }

  /* ---- Numbered flow ---- */
  .flow { counter-reset: step; display: grid; gap: 0; margin-top: 2.4rem; }
  .flow > div { display: grid; grid-template-columns: 62px 1fr; gap: 1.4rem; padding: 1.5rem 0; border-bottom: 1px solid var(--line); align-items: start; }
  .flow .step { color: var(--accent); font-variant-numeric: tabular-nums; font-size: 0.78rem; letter-spacing: 0.16em; padding-top: 0.35rem; }
  .flow h3 { margin-bottom: 0.3rem; }
  .flow p { font-size: 0.95rem; color: var(--muted); margin: 0; }

  /* ---- Tier table ---- */
  .tiers { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 1.4rem; margin-top: 2.6rem; }
  .tier { border: 1px solid var(--line); border-radius: 14px; padding: 2rem 1.8rem; background: var(--ink-2); display: flex; flex-direction: column; }
  .tier.featured { border-color: var(--accent); background: linear-gradient(180deg, rgba(200,134,42,0.10), rgba(20,20,24,1) 55%); }
  .tier .flag { font-size: 0.66rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.9rem; display: block; min-height: 1em; }
  .tier .price { font-size: 2.3rem; font-weight: 600; letter-spacing: -0.03em; margin: 0.7rem 0 0.15rem; }
  .tier .per { font-size: 0.82rem; color: var(--muted); }
  .tier ul { list-style: none; padding: 0; margin: 1.6rem 0 0; font-size: 0.93rem; }
  .tier li { padding: 0.52rem 0 0.52rem 1.4rem; position: relative; color: #cbc7c0; border-top: 1px solid var(--line); }
  .tier li:first-child { border-top: 0; }
  .tier li::before { content: ""; position: absolute; left: 0; top: 1.02em; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }

  /* ---- Spec list ---- */
  .spec { border-top: 1px solid var(--line); margin-top: 2.4rem; }
  .spec > div { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; padding: 1.35rem 0; border-bottom: 1px solid var(--line); }
  .spec strong { font-weight: 600; }
  .spec span { color: var(--muted); font-size: 0.95rem; }

  /* ---- Phases ---- */
  .phases { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.4rem; margin-top: 2.6rem; }
  .phase { border: 1px solid var(--line); border-radius: 14px; padding: 1.9rem; background: var(--ink-2); }
  .phase .n { font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); }
  .phase h3 { margin: 0.7rem 0 0.6rem; }
  .phase p { font-size: 0.93rem; color: var(--muted); margin: 0; }

  /* ---- Comparison table ---- */
  .compare-wrap { overflow-x: auto; margin-top: 1.8rem; border: 1px solid var(--line-2); border-radius: 14px; }
  table.compare { width: 100%; border-collapse: collapse; min-width: 460px; }
  table.compare th, table.compare td { padding: 1.05rem 1.2rem; text-align: right; white-space: nowrap; border-bottom: 1px solid var(--line); }
  table.compare th:first-child, table.compare td:first-child { text-align: left; }
  table.compare thead th {
    font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted);
    font-weight: 600; background: rgba(255,255,255,0.03);
  }
  table.compare tbody td { font-variant-numeric: tabular-nums; }
  table.compare tbody tr:last-child td { border-bottom: 0; }
  table.compare .win { color: var(--accent); font-weight: 600; }
  table.compare .even { color: var(--muted); }

  /* ---- Summary ---- */
  .summary { border: 1px solid var(--line-2); border-radius: 14px; overflow: hidden; margin-top: 2.4rem; }
  .summary > div { display: flex; justify-content: space-between; gap: 1.5rem; padding: 1.25rem 1.6rem; border-bottom: 1px solid var(--line); }
  .summary > div:last-child { border-bottom: 0; background: rgba(200,134,42,0.09); }
  .summary .who { font-size: 0.95rem; }
  .summary .who b { display: block; margin-bottom: 0.2rem; }
  .summary .who span { color: var(--muted); font-size: 0.86rem; }
  .summary .amt { white-space: nowrap; font-weight: 600; }

  figure { margin: 2.8rem 0 0; }
  figcaption { font-size: 0.82rem; color: var(--muted); margin-top: 1rem; text-align: center; }
  .diagram { border: 1px solid var(--line); border-radius: 14px; background: var(--ink-2); padding: 1.6rem; }
  .diagram svg { width: 100%; height: auto; display: block; }

  footer { padding: 70px 0 90px; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.9rem; }
  footer strong { color: var(--text); }

  @media (max-width: 640px) {
    body { font-size: 16px; }
    /* The full confidentiality line collides with the wordmark on a phone.
       Shorten it here; the full statement is in the footer either way. */
    .cover-top { font-size: 0.62rem; letter-spacing: 0.14em; padding: 22px 28px; }
    .cover-top .long { display: none; }
    .cover-top .short { display: inline; }
    section { padding: 62px 0; }
    .spec > div { grid-template-columns: 1fr; gap: 0.4rem; }
    .flow > div { grid-template-columns: 44px 1fr; gap: 1rem; }
    .cover-meta { gap: 1.6rem; }
  }
  @media print {
    body { background: #fff; color: #111; }
    section { page-break-inside: avoid; border-color: #ddd; }
    .card, .tier, .phase, .diagram, .summary { background: #fff; border-color: #ccc; }
  }
</style>
</head>
<body>

<!-- ============ COVER ============ -->
<section class="cover">
  <div class="cover-img"><img src="${ROOM_RENDER}" alt="Concept render of the CBSR content studio: two chairs, podcast microphones, acoustic wall and a branded screen" /></div>
  <div class="cover-top">
    <span>SDub Media</span>
    <span><span class="long">Confidential &middot; Prepared for CBSR Murfreesboro</span><span class="short" style="display:none">Confidential</span></span>
  </div>
  <div class="cover-inner">
    <span class="label">Studio Proposal &middot; Murfreesboro Office &middot; Version 1.0</span>
    <h1>The CBSR<br />Content Studio</h1>
    <p class="cover-sub">A permanent room where any agent, broker or leader can walk in, press one button, and produce content that looks like it came from the brand.</p>
    <div class="cover-meta">
      <div>Prepared for<strong>Coldwell Banker Southern Realty</strong></div>
      <div>Office<strong>Murfreesboro</strong></div>
      <div>Prepared by<strong>SDub Media</strong></div>
      <div>Room<strong>9&#8202;&times;&#8202;12 interior</strong></div>
    </div>
  </div>
</section>

<!-- ============ CONTENTS ============ -->
<section>
  <div class="wrap">
    <span class="label">Contents</span>
    <div class="toc">
      <a href="#why"><span class="n">01</span> Why a studio</a>
      <a href="#room"><span class="n">02</span> The room</a>
      <a href="#tech"><span class="n">03</span> The technology</a>
      <a href="#session"><span class="n">04</span> How a session works</a>
      <a href="#partnership"><span class="n">05</span> The partnership</a>
      <a href="#phases"><span class="n">06</span> Phasing</a>
      <a href="#summary"><span class="n">07</span> Investment summary</a>
      <a href="#next"><span class="n">08</span> Next steps</a>
    </div>
    <p class="muted" style="font-size:0.93rem;margin-top:2.2rem;max-width:70ch">This proposal covers one studio at the Murfreesboro office. The pricing, the included hours and the member rate all apply to that room and that office. Other CBSR offices are covered on page 05.</p>
  </div>
</section>

<!-- ============ 01 WHY ============ -->
<section id="why">
  <div class="narrow">
    <span class="label">01 &middot; Why a studio</span>
    <h2>The bottleneck was never the ideas. It was the setup.</h2>
    <div class="rule"></div>
    <p class="lede">CBSR already knows video works. What has been missing is a room where it can happen without scheduling anybody.</p>
    <p>SDub Media has been photographing and filming for CBSR long enough to see the pattern. The monthly headshot days work because the room is set up and the agent just shows up. Sit one broker down with his top agents for a couple of hours and it becomes nineteen finished pieces. The output is never the problem.</p>
    <p>The problem is that every piece of video currently requires a booking, a crew, a load-in and a teardown. That ceiling is a logistics ceiling, not a talent one. A permanent studio removes it: the lights are already aimed, the microphones are already placed, and the cameras are already framed on the two chairs.</p>
    <p>What that unlocks is not one more marketing channel. It is a recruiting tool that runs on its own, a training library that builds itself, and a reason for an agent to choose CBSR over the brokerage down the road that cannot offer them a studio.</p>
  </div>
</section>

<!-- ============ 02 THE ROOM ============ -->
<section id="room">
  <div class="wrap">
    <div class="narrow" style="padding:0">
      <span class="label">02 &middot; The room</span>
      <h2>CBSR builds the room. SDub Media builds the studio.</h2>
      <div class="rule"></div>
      <p class="lede">A clean split. You own what people see. We own what has to work.</p>
      <p>The concept render on the cover is the target: dark walls, a warm slat feature behind the talent, acoustic treatment on the camera-left wall, a branded screen, and two chairs at a comfortable conversational angle. All of that is dressing, and dressing is where a small budget goes furthest. It is also the part that has to feel like CBSR, which is why it belongs to CBSR.</p>
      <p>Everything that has to power on, stay in focus, hold a level and record cleanly is ours.</p>
    </div>

    <figure>
      <div class="diagram">
        ${floorPlanSvg()}
      </div>
      <figcaption>Indicative layout of the 9&#8202;&times;&#8202;12 room. Final positions set on the install day against the real walls and outlets.</figcaption>
    </figure>

    <div class="cols" style="margin-top:3rem">
      <div class="card">
        <h3>CBSR provides</h3>
        <p>The room itself, paint and the slat feature wall, acoustic panels, the two chairs and table, the screen, practical lamps, and power at the positions marked on the plan.</p>
      </div>
      <div class="card">
        <h3>SDub Media provides</h3>
        <p>Every camera, lens and mount. The switcher and recorder. The audio chain. The key and fill lighting. Cabling, media, and the labelled one-button control surface.</p>
      </div>
      <div class="card">
        <h3>Nobody has to own the problem</h3>
        <p>When a camera needs a firmware update, a microphone starts buzzing, or a format changes, that is our call to make and our cost to carry. Not a line item on a CBSR budget two years from now.</p>
      </div>
    </div>
  </div>
</section>

<!-- ============ 03 TECHNOLOGY ============ -->
<section id="tech">
  <div class="wrap">
    <div class="narrow" style="padding:0">
      <span class="label">03 &middot; The technology</span>
      <h2>Specified so an agent cannot get it wrong.</h2>
      <div class="rule"></div>
      <p class="lede">The temptation with a studio like this is to fill it with cinema cameras. We are deliberately not doing that, and the reason matters.</p>
      <p>Cinema cameras need cards offloaded, batteries watched, and shots colour-matched afterwards. Put three of them in a room that agents use unsupervised and the first person to record a good conversation will discover afterwards that one camera stopped at the 30 minute mark. They will not blame the camera. They will stop using the room.</p>
      <p>So the room is built around fixed cameras running on wall power, feeding a single switcher that records every angle and the finished mix at once, to one drive, on one button. Nothing to mount, nothing to charge, nothing to match.</p>
    </div>

    <figure>
      <div class="diagram">
        ${signalFlowSvg()}
      </div>
      <figcaption>Signal flow. Three angles and two microphones resolve to one press of record and one file set.</figcaption>
    </figure>

    <div class="spec">
      <div><strong>Three fixed camera positions</strong><span>One framed on each chair, one wide two-shot. Permanently mounted, permanently powered, permanently framed. Nobody adjusts anything.</span></div>
      <div><strong>Switcher and multi-track recorder</strong><span>Records the live cut plus every isolated camera angle simultaneously. The edit is never limited to the choices somebody made in the moment.</span></div>
      <div><strong>Broadcast audio chain</strong><span>Two microphones on arms into a dedicated podcast console. Levels are set once and locked. Audio is what makes cheap video watchable and good video unwatchable.</span></div>
      <div><strong>Fixed key and fill lighting</strong><span>Aimed and locked on install so both chairs are lit the same way every session, whatever the time of day or the weather outside.</span></div>
      <div><strong>One labelled control surface</strong><span>Record, stop, and switch. That is the entire operating instruction, and it is printed on the wall.</span></div>
      <div><strong>Media and handoff</strong><span>Recordings land on studio media that SDub Media collects and clears on a set cadence. Nobody at CBSR manages storage or files.</span></div>
    </div>
  </div>
</section>

<!-- ============ 04 SESSION ============ -->
<section id="session">
  <div class="narrow">
    <span class="label">04 &middot; How a session works</span>
    <h2>Six steps, and CBSR is responsible for two of them.</h2>
    <div class="rule"></div>
    <div class="flow">
      <div><span class="step">01</span><div><h3>Book the room</h3><p>A shared calendar, the same way a conference room is booked. No crew to coordinate with.</p></div></div>
      <div><span class="step">02</span><div><h3>Walk in and sit down</h3><p>Lights, cameras and microphones are already on and already aimed. There is no setup step.</p></div></div>
      <div><span class="step">03</span><div><h3>Press record</h3><p>One button. All three angles and both microphones start together.</p></div></div>
      <div><span class="step">04</span><div><h3>Have the conversation</h3><p>Talk for as long as it is worth talking. Press stop and leave.</p></div></div>
      <div><span class="step">05</span><div><h3>SDub Media edits</h3><p>We collect the recordings, cut the long piece and pull the short vertical clips out of it.</p></div></div>
      <div><span class="step">06</span><div><h3>Delivered ready to post</h3><p>Finished files land in a CBSR gallery, captioned and sized for where they are going.</p></div></div>
    </div>
  </div>
</section>

<!-- ============ 05 PARTNERSHIP ============ -->
<section id="partnership">
  <div class="wrap">
    <div class="narrow" style="padding:0">
      <span class="label">05 &middot; The partnership</span>
      <h2>A managed studio, not an equipment lease.</h2>
      <div class="rule"></div>
      <p class="lede">CBSR invests in the room. SDub Media owns, maintains and refreshes everything in it.</p>
      <p>The alternative is buying roughly nine thousand dollars of technology outright, and then owning it through every firmware change, every failure and every format shift for the next five years. This structure puts that on us. The studio stays production ready because keeping it production ready is what CBSR is paying for.</p>
    </div>

    <div class="tiers">
      <div class="tier">
        <span class="flag">&nbsp;</span>
        <h3>Studio Program</h3>
        <div class="price">$795</div>
        <div class="per">per month &middot; 12 month term</div>
        <ul>
          <li>All studio technology provided, installed and calibrated</li>
          <li>Maintenance, firmware and replacements covered</li>
          <li>Technical support and a quarterly on-site check</li>
          <li>Unlimited self-serve use of the room by the Murfreesboro office</li>
          <li>Production and editing at the member rate below</li>
        </ul>
      </div>
      <div class="tier featured">
        <span class="flag">Recommended</span>
        <h3>Studio &plus; Production</h3>
        <div class="price">$1,750</div>
        <div class="per">per month &middot; 12 month term</div>
        <ul>
          <li>Everything in the Studio Program</li>
          <li>A production day every month, filmed with you</li>
          <li>Seven hours of production and editing included</li>
          <li>Quarterly content planning session</li>
          <li>First call on the calendar for Murfreesboro shoots</li>
        </ul>
      </div>
    </div>

    <div class="narrow" style="padding:3.2rem 0 0">
      <h3 style="font-size:1.25rem;margin-bottom:1rem">Production is billed by the hour, at a member rate.</h3>
      <p>Beyond what a tier includes, filming and editing are billed as used. The Murfreesboro office pays a member rate for as long as its studio program is active.</p>
      <div class="summary" style="margin-top:1.8rem">
        <div>
          <div class="who"><b>Standard rate</b><span>What any client pays for filming and editing</span></div>
          <div class="amt muted" style="text-decoration:line-through">$200 / hour</div>
        </div>
        <div>
          <div class="who"><b>Murfreesboro member rate</b><span>While the studio program is active at that office</span></div>
          <div class="amt">$160 / hour</div>
        </div>
      </div>
      <p style="margin-top:1.5rem">Hours are quoted before the work starts and invoiced after it is delivered. Nothing is ever charged for time nobody asked for.</p>

      <h3 style="font-size:1.25rem;margin:2.8rem 0 1rem">Other CBSR offices</h3>
      <p>The member rate belongs to the office running the studio. Work for the other CBSR offices is billed at the standard rate, because the rate is funded by the program rather than by the brand on the door.</p>
      <p>It widens as the studios do. A second office on its own studio program puts <strong>both</strong> offices on the member rate. A third puts all three on it, and so on across the brokerage. Each room is priced the same, since the technology in it costs the same, and installation is waived on the term exactly as it is here.</p>

      <h3 style="font-size:1.25rem;margin:2.8rem 0 1rem">Installation</h3>
      <p>Building the studio is a day of work: mounting and framing three cameras, running cable, setting up the switcher and the audio chain, calibrating the lighting, labelling the controls, and walking through it with whoever will use the room most.</p>
      <div class="summary" style="margin-top:1.8rem">
        <div>
          <div class="who"><b>Installation and calibration</b><span>One time, before the first session</span></div>
          <div class="amt">$1,500</div>
        </div>
        <div>
          <div class="who"><b>On a twelve month term</b><span>Either tier</span></div>
          <div class="amt">Waived</div>
        </div>
      </div>
      <p class="muted" style="font-size:0.93rem;margin-top:1.6rem">Twelve month term, month to month after that. Equipment remains the property of SDub Media throughout, which is what keeps CBSR out of the upgrade cycle. The program can move up a tier at any point in the term without a new agreement.</p>
    </div>
  </div>
</section>

<!-- ============ 06 PHASES ============ -->
<section id="phases">
  <div class="wrap">
    <div class="narrow" style="padding:0">
      <span class="label">06 &middot; Phasing</span>
      <h2>Start with the room that pays for itself.</h2>
      <div class="rule"></div>
      <p class="lede">Nothing here requires committing to the full build on day one. The order below is deliberate: each phase produces content before the next one is discussed.</p>
    </div>
    <div class="phases">
      <div class="phase">
        <span class="n">Phase 01</span>
        <h3>The self-serve room</h3>
        <p>Dressing, install, three fixed angles, audio and lighting. From this point the Murfreesboro office can record any conversation, any day, without booking anybody. This is the phase that has to prove itself, and it is designed to.</p>
      </div>
      <div class="phase">
        <span class="n">Phase 02</span>
        <h3>The content engine</h3>
        <p>A standing monthly rhythm: recurring interview series, agent spotlights, market updates. The room stops being a facility and starts being a publishing schedule.</p>
      </div>
      <div class="phase">
        <span class="n">Phase 03</span>
        <h3>The cinema gear</h3>
        <p>When leadership, recruiting or brand pieces need to look like more than a podcast, SDub brings the cinema cameras into the same room with an operator. Same space, higher gear, no second build.</p>
      </div>
    </div>
  </div>
</section>

<!-- ============ 07 SUMMARY ============ -->
<section id="summary">
  <div class="wrap">
    <div class="narrow" style="padding:0">
      <span class="label">07 &middot; Investment summary</span>
      <h2>What each side is actually putting in.</h2>
      <div class="rule"></div>
    </div>
    <div class="summary" style="max-width:760px;margin-left:auto;margin-right:auto">
      <div>
        <div class="who"><b>Murfreesboro &middot; one time</b><span>Room dressing: paint, slat wall, acoustic panels, chairs, table, screen, lamps</span></div>
        <div class="amt">CBSR budget</div>
      </div>
      <div>
        <div class="who"><b>SDub Media &middot; one time</b><span>All studio technology, install, framing, calibration and labelling</span></div>
        <div class="amt">Included</div>
      </div>
      <div>
        <div class="who"><b>SDub Media &middot; one time</b><span>Installation and calibration, waived on the twelve month term</span></div>
        <div class="amt">Waived</div>
      </div>
      <div>
        <div class="who"><b>Murfreesboro &middot; monthly</b><span>Studio &plus; Production, the recommended tier, including seven hours a month</span></div>
        <div class="amt">$1,750 / month</div>
      </div>
      <div>
        <div class="who"><b>Murfreesboro &middot; as used</b><span>Filming and editing beyond the included hours, at the member rate</span></div>
        <div class="amt">$160 / hour</div>
      </div>
    </div>
    <div class="narrow" style="padding:2.4rem 0 0">
      <p>There is no equipment purchase and no separate support contract, and installation is waived on the twelve month term. Everything that has to work is covered by the monthly figure, and the work CBSR asks for on top of it is quoted before it starts.</p>
      <h3 style="font-size:1.25rem;margin:3rem 0 1rem">Compared with building it yourselves</h3>
      <p>The comparison worth making is not against doing nothing. It is against buying the technology outright, owning it through every failure and format change, and still paying standard rate for the production. Owning cameras does not edit anything.</p>
      <p class="muted" style="font-size:0.93rem">Both columns assume the same seven hours of production and editing a month. Buying it yourselves carries the equipment and installation up front, and bills those hours at the $200 standard rate.</p>
      <div class="compare-wrap">
        <table class="compare">
          <thead>
            <tr>
              <th scope="col">Total spent by</th>
              <th scope="col">Buying it yourselves</th>
              <th scope="col">This program</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>12 months</td><td>$28,200</td><td>$21,000</td><td class="win">Murfreesboro saves $7,200</td></tr>
            <tr><td>24 months</td><td>$45,000</td><td>$42,000</td><td class="win">Murfreesboro saves $3,000</td></tr>
            <tr><td>36 months</td><td>$61,800</td><td>$63,000</td><td class="even">Within $1,200</td></tr>
          </tbody>
        </table>
      </div>
      <p style="margin-top:1.5rem">By year three the two are close enough to call even, and that is the honest answer. What separates them at that point is what happens next: owned equipment is due for replacement around then, and under this program that is our cost and our problem, not a line on a CBSR budget.</p>
      <p style="margin-top:1.5rem">There is a simpler way to look at it. Seven hours of production at the standard rate is $1,400. The recommended tier is $1,750. Every camera, the install, the maintenance, the replacements and the support cost CBSR <strong>$350 a month</strong> on top of work you would be buying anyway.</p>
    </div>
  </div>
</section>

<!-- ============ 08 NEXT ============ -->
<section id="next">
  <div class="narrow">
    <span class="label">08 &middot; Next steps</span>
    <h2>Three decisions, in this order.</h2>
    <div class="rule"></div>
    <div class="flow">
      <div><span class="step">01</span><div><h3>Confirm the room</h3><p>Which office, which room, and a walkthrough to measure the real wall positions and power.</p></div></div>
      <div><span class="step">02</span><div><h3>Pick a tier</h3><p>Studio &plus; Production is the recommendation. The Studio Program alone is the smallest sensible starting point.</p></div></div>
      <div><span class="step">03</span><div><h3>Set the install date</h3><p>Dressing first, technology second, and a short session with whoever will use the room most.</p></div></div>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <p><strong>SDub Media</strong> &middot; Nolensville, Tennessee &middot; <a href="mailto:geoff@sdubmedia.com">geoff@sdubmedia.com</a></p>
    <p style="margin-top:0.4rem">Prepared for Coldwell Banker Southern Realty. This document is confidential and intended only for the recipient. Pricing held for 30 days from the date sent.</p>
  </div>
</footer>

</body>
</html>`;
}

// ---------------------------------------------------------------
// Diagrams are inline SVG rather than exported images: they stay crisp at any
// size, they print cleanly, and they carry no external request.
// ---------------------------------------------------------------

function floorPlanSvg() {
  const L = 'rgba(255,255,255,0.28)';
  const T = '#9b978f';
  return `<svg viewBox="0 0 720 470" role="img" aria-label="Floor plan of the 9 by 12 foot studio room showing three camera positions, two chairs, the feature wall and acoustic treatment">
    <defs>
      <pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="7" stroke="${ACCENT}" stroke-opacity="0.35" stroke-width="2"/>
      </pattern>
    </defs>

    <!-- room shell : 12ft wide x 9ft deep -->
    <rect x="90" y="60" width="540" height="330" fill="none" stroke="${L}" stroke-width="2"/>

    <!-- dimensions -->
    <line x1="90" y1="38" x2="630" y2="38" stroke="${T}" stroke-width="1"/>
    <line x1="90" y1="32" x2="90" y2="44" stroke="${T}" stroke-width="1"/>
    <line x1="630" y1="32" x2="630" y2="44" stroke="${T}" stroke-width="1"/>
    <text x="360" y="28" fill="${T}" font-size="12" text-anchor="middle" font-family="sans-serif" letter-spacing="1.5">12 FT</text>
    <line x1="68" y1="60" x2="68" y2="390" stroke="${T}" stroke-width="1"/>
    <line x1="62" y1="60" x2="74" y2="60" stroke="${T}" stroke-width="1"/>
    <line x1="62" y1="390" x2="74" y2="390" stroke="${T}" stroke-width="1"/>
    <text x="40" y="230" fill="${T}" font-size="12" text-anchor="middle" font-family="sans-serif" letter-spacing="1.5" transform="rotate(-90 40 230)">9 FT</text>

    <!-- feature wall (slat + screen) along the top -->
    <rect x="200" y="60" width="320" height="14" fill="url(#hatch)" stroke="${ACCENT}" stroke-opacity="0.5"/>
    <text x="360" y="94" fill="${ACCENT}" font-size="11" text-anchor="middle" font-family="sans-serif" letter-spacing="1.4">SLAT WALL + SCREEN</text>

    <!-- acoustic treatment on the right wall -->
    <rect x="616" y="120" width="14" height="210" fill="url(#hatch)" stroke="${ACCENT}" stroke-opacity="0.5"/>
    <text x="606" y="225" fill="${ACCENT}" font-size="11" text-anchor="middle" font-family="sans-serif" letter-spacing="1.4" transform="rotate(-90 606 225)">ACOUSTIC PANELS</text>

    <!-- door, bottom left -->
    <path d="M90 330 L90 390" stroke="${ACCENT}" stroke-width="3"/>
    <path d="M90 330 A60 60 0 0 1 150 390" fill="none" stroke="${L}" stroke-width="1" stroke-dasharray="4 4"/>
    <text x="118" y="410" fill="${T}" font-size="11" text-anchor="middle" font-family="sans-serif">DOOR</text>

    <!-- chairs -->
    <rect x="252" y="188" width="66" height="66" rx="10" fill="none" stroke="${L}" stroke-width="2"/>
    <text x="285" y="226" fill="${T}" font-size="11" text-anchor="middle" font-family="sans-serif">CHAIR A</text>
    <rect x="402" y="188" width="66" height="66" rx="10" fill="none" stroke="${L}" stroke-width="2"/>
    <text x="435" y="226" fill="${T}" font-size="11" text-anchor="middle" font-family="sans-serif">CHAIR B</text>
    <circle cx="360" cy="221" r="24" fill="none" stroke="${L}" stroke-width="1.5"/>
    <text x="360" y="225" fill="${T}" font-size="10" text-anchor="middle" font-family="sans-serif">TABLE</text>

    <!-- cameras -->
    ${cam(170, 300, 'CAM 1', 'chair B')}
    ${cam(550, 300, 'CAM 2', 'chair A')}
    ${cam(360, 356, 'CAM 3', 'wide two shot')}

    <!-- sight lines -->
    <line x1="182" y1="292" x2="420" y2="212" stroke="${ACCENT}" stroke-opacity="0.32" stroke-width="1" stroke-dasharray="5 5"/>
    <line x1="538" y1="292" x2="300" y2="212" stroke="${ACCENT}" stroke-opacity="0.32" stroke-width="1" stroke-dasharray="5 5"/>
    <line x1="360" y1="344" x2="360" y2="250" stroke="${ACCENT}" stroke-opacity="0.32" stroke-width="1" stroke-dasharray="5 5"/>

    <!-- lighting -->
    ${lamp(170, 130, 'KEY')}
    ${lamp(550, 130, 'FILL')}

    <!-- rack -->
    <rect x="486" y="352" width="112" height="30" rx="5" fill="none" stroke="${L}" stroke-width="1.5"/>
    <text x="542" y="371" fill="${T}" font-size="10" text-anchor="middle" font-family="sans-serif" letter-spacing="1">SWITCHER + AUDIO</text>
  </svg>`;
}

function cam(x, y, name, aim) {
  return `<g>
    <circle cx="${x}" cy="${y}" r="15" fill="${ACCENT}" fill-opacity="0.16" stroke="${ACCENT}" stroke-width="1.6"/>
    <circle cx="${x}" cy="${y}" r="4" fill="${ACCENT}"/>
    <text x="${x}" y="${y + 32}" fill="${ACCENT}" font-size="11" text-anchor="middle" font-family="sans-serif" letter-spacing="1">${name}</text>
    <text x="${x}" y="${y + 46}" fill="#9b978f" font-size="10" text-anchor="middle" font-family="sans-serif">${aim}</text>
  </g>`;
}

function lamp(x, y, name) {
  return `<g>
    <rect x="${x - 13}" y="${y - 9}" width="26" height="18" rx="3" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
    <text x="${x}" y="${y + 26}" fill="#9b978f" font-size="10" text-anchor="middle" font-family="sans-serif" letter-spacing="1">${name} LIGHT</text>
  </g>`;
}

function signalFlowSvg() {
  const T = '#9b978f';
  const L = 'rgba(255,255,255,0.22)';
  const box = (x, y, w, h, title, sub, accent) => `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${accent ? 'rgba(200,134,42,0.10)' : 'rgba(255,255,255,0.03)'}" stroke="${accent ? ACCENT : L}" stroke-width="${accent ? 1.8 : 1.4}"/>
      <text x="${x + w / 2}" y="${y + (sub ? h / 2 - 3 : h / 2 + 4)}" fill="${accent ? ACCENT : '#eceae6'}" font-size="12.5" text-anchor="middle" font-family="sans-serif" letter-spacing="0.4">${title}</text>
      ${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 15}" fill="${T}" font-size="10.5" text-anchor="middle" font-family="sans-serif">${sub}</text>` : ''}
    </g>`;
  const arrow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${ACCENT}" stroke-opacity="0.5" stroke-width="1.4" marker-end="url(#ar)"/>`;

  return `<svg viewBox="0 0 720 330" role="img" aria-label="Signal flow diagram: three cameras and two microphones feed a switcher and recorder, which produces one set of files for SDub Media to edit">
    <defs>
      <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill="${ACCENT}" fill-opacity="0.65"/>
      </marker>
    </defs>

    <text x="96" y="26" fill="${T}" font-size="10.5" text-anchor="middle" font-family="sans-serif" letter-spacing="2">IN THE ROOM</text>
    ${box(20, 44, 152, 46, 'Camera 1', 'chair B')}
    ${box(20, 104, 152, 46, 'Camera 2', 'chair A')}
    ${box(20, 164, 152, 46, 'Camera 3', 'wide two shot')}
    ${box(20, 232, 152, 46, 'Microphones', 'one per chair')}

    ${arrow(178, 67, 286, 130)}
    ${arrow(178, 127, 286, 140)}
    ${arrow(178, 187, 286, 152)}
    ${arrow(178, 255, 286, 176)}

    <text x="372" y="26" fill="${T}" font-size="10.5" text-anchor="middle" font-family="sans-serif" letter-spacing="2">ONE BUTTON</text>
    ${box(292, 108, 162, 96, 'Switcher', 'records every angle', true)}
    <text x="373" y="228" fill="${ACCENT}" font-size="11" text-anchor="middle" font-family="sans-serif" letter-spacing="1.4">PRESS RECORD</text>

    ${arrow(460, 138, 546, 112)}
    ${arrow(460, 172, 546, 198)}

    <text x="632" y="26" fill="${T}" font-size="10.5" text-anchor="middle" font-family="sans-serif" letter-spacing="2">WHAT COMES OUT</text>
    ${box(552, 88, 152, 46, 'Live cut', 'ready as filmed')}
    ${box(552, 176, 152, 46, 'Every angle', 'for the edit')}

    <path d="M628 138 L628 168" stroke="${L}" stroke-width="1.2" stroke-dasharray="3 3"/>
    ${box(552, 250, 152, 46, 'SDub Media edits', 'delivered ready to post')}
    ${arrow(628, 226, 628, 246)}
  </svg>`;
}
