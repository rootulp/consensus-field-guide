# The Consensus Field Guide

An interactive, educational site about blockchain consensus. It has two levels:

- **The family tree** (`/`): every protocol from the Byzantine Generals (1982) to Multimmit (2026), placed by year and
  family, with lines showing which ideas each one built on.
- **Lessons** (`/lessons/`): a deep dive per protocol, with a live animation you can break, what was new, the
  trade-offs, a quiz, and links to the original papers. Today: Tendermint, Simplex and Minimmit.

## Run it

Requires Node 22.23.4 or newer (Node 24 works).

```sh
npm install
npm run dev      # http://localhost:4321
```

Other scripts:

```sh
npm run build    # static site in dist/
npm run preview  # serve dist/
npm run check    # type-check .astro and .ts files
npm test         # unit tests for the simulations
```

## How it's organized

| Path | What |
| --- | --- |
| `src/data/protocols.ts` | Every protocol on the tree, its family, position, summary, and the parent → child edges. |
| `src/lib/sims/` | Pure TypeScript models of each protocol's animation, unit-tested in `test/`. |
| `src/components/sims/` | The animations: markup plus a small script that drives a model. |
| `src/layouts/Lesson.astro` | Shared lesson frame: header, family strip, papers, mark-as-read, prev/next. |
| `src/pages/lessons/` | One page per lesson. |

## Adding a lesson

1. Write a model in `src/lib/sims/<name>.ts` with tests in `test/`.
2. Add a component in `src/components/sims/` that renders it.
3. Set `lesson` and `minutes` on the protocol in `src/data/protocols.ts`.
4. Create `src/pages/lessons/<name>.astro` using the `Lesson` layout.

The simulations are teaching models, not implementations. Every claim in a lesson should trace back to a linked paper
or specification.
