# The Consensus Field Guide

An interactive site about blockchain consensus, from the Byzantine Generals to Multimmit.

- **The family tree** (`/`): 17 topics positioned by year and family, with links showing the ideas they built on.
- **Lessons** (`/lessons/`): all 17 topics have explanations, interactive examples, trade-offs, two quizzes, primary sources, and saved reading progress.
- **Glossary** (`/glossary/`): plain-language terms with examples, stable links, and related lessons.
- **About** (`/about/`): the guide’s scope and a link to report corrections through GitHub Issues.

## Run it

Requires Node 22.23.4 or newer (Node 24 works).

```sh
npm ci
npm run dev      # http://localhost:4321
npm run check    # Astro and TypeScript diagnostics
npm test         # Simulation behavior and walkthrough coverage
npm run build    # Static site in dist/
npm run preview  # Serve the production build
```

Browser regression checks run against the production build on desktop and mobile:

```sh
npx playwright install chromium
npm run build
npm run test:browser
```

On a Linux host without browser libraries, use `npx playwright install --with-deps chromium`.
In a restricted workspace, `ASTRO_TELEMETRY_DISABLED=1` avoids Astro’s user-configuration writes,
and `PLAYWRIGHT_BROWSERS_PATH` can point to a writable browser cache.

## Reading and playback

All diagrams start paused. Use **Step**, or **Play** with 3, 6 (default), or 10 seconds per step.
Playback pauses when the diagram leaves the viewport or the tab becomes hidden. Finite runs stop
at their final state; **Replay** and **Restart** let readers revisit them. Changed cards retain an
outline and a text label, and new walkthroughs retain a readable step history.

Tendermint, Simplex, and Minimmit use executable teaching models with offline controls. The other
14 lessons use authored, two-scenario traces that isolate each topic’s key idea. These traces are
explicitly labeled, state their assumptions and omissions, and are not complete protocol implementations.
In particular, the Multimmit lesson follows draft v1 and separates proposed-position extraction,
extension rules, membership finality, and total-order placement.

## How it is organized

| Path | Purpose |
| --- | --- |
| `src/data/protocols.ts` | Family-tree metadata, relationships, lesson slugs, and reading times. |
| `src/data/lessons/` | Typed lesson content, sources, quizzes, and scenario frames for the 14 new topics. |
| `src/pages/lessons/[slug].astro` | Static generation of the data-driven lessons. |
| `src/pages/lessons/{tendermint,simplex,minimmit}.astro` | The three original, individually authored lessons. |
| `src/lib/sims/` | Pure simulation models and walkthrough navigation. |
| `src/lib/playback.ts` | Shared playback timing, pause, step, restart, and completion behavior. |
| `src/components/sims/` | Simulation views, guided walkthrough renderer, and shared controls. |
| `src/layouts/Lesson.astro` | Shared lesson frame, sources, read progress, and previous/next links. |
| `test/` | Unit tests; `test/browser/` checks every lesson on desktop and mobile. |

## Adding or editing a lesson

For a guided walkthrough, add a typed entry in `src/data/lessons/` with narrative sections, primary
sources, two quizzes, and meaningful normal/fault or contrasting scenarios. Keep card labels stable
within a scenario so changes are easy to compare. Register its matching slug and minutes in
`src/data/protocols.ts`; the dynamic route generates its static page.

For an executable simulation, add a pure model in `src/lib/sims/` with behavioral tests, a view in
`src/components/sims/`, and a lesson page using `Lesson`. Reuse `PlaybackControls` and `setupPlayback`.

Keep `compressHTML: false` in `astro.config.mjs`: HTML compression previously removed word boundaries
before inline emphasis on new source lines. The browser suite checks those boundaries in built pages,
not just in source templates.

Every protocol claim should trace to a linked paper or specification. Mark historical rules, draft
versions, simplified diagrams, and omitted production behavior explicitly.
