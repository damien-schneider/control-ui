# Contributing

Thanks for helping improve Control UI.

## Setup

```bash
bun install
bun run dev
```

The docs app serves at `http://127.0.0.1:3000`. No environment variables are required for local work; optional ones live in `apps/docs/.env.example` (registry URL override, canonical site URL, search-engine verification tokens). In production the canonical URL resolves from `NEXT_PUBLIC_SITE_URL`, falling back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL`.

Heads-up: the docs app tracks bleeding-edge tooling — Next.js preview releases and the TypeScript native preview (`typescript@7`). Use the pinned Bun version from `package.json` (`packageManager`) if a check behaves differently on your machine.

## Source of truth and generated files

Component and primitive source lives in `apps/docs/src/registry/sources/control-ui`; the product catalog lives in `apps/docs/app/(features)/catalog`. Everything else registry-shaped is generated from those (see the Repository layout section of the README).

After changing registry source, catalog metadata, or skin packs:

```bash
bun run sync
```

Commit the regenerated outputs together with your change. Generated files are marked `linguist-generated` so they stay collapsed in review; `bun run validate` fails on any drift between sources and outputs.

`packages/components` is generated from the same manifests: `bun run build` regenerates its `src/` from `apps/docs/registry` before bundling, so run `bun run sync` first and never edit `src/` by hand.

## Checks

All of these must pass before a PR:

```bash
bun run validate
bun run typecheck
bun run lint
bun run format:check
cd apps/docs && bun test
```

Browser tests (`bun run test:browser` in `apps/docs`) require Playwright browsers installed locally.

For interaction performance, run `bun run test:browser e2e/sidebar-performance.pw.ts e2e/dropdown-performance.pw.ts e2e/tabs-performance.pw.ts e2e/tabs-transition.pw.ts` in `apps/docs`.
These tests measure Chromium main-thread CPU time over repeated real pointer interactions, attach the samples to the test report,
and check warmed medians. Run them without other CPU-heavy checks. Tracing and development overlays are disabled for these measurements
so recorder and diagnostic work do not count against application budgets.
Tab coverage includes populated docs panels and a 200-item fixture, plus synchronized slides, height changes, keyboard navigation,
reduced motion, interrupted transitions, and retained example and scroll state.
Run `bun run test:browser e2e/component-performance.pw.ts` for 400-entry accordions, collapsibles, and resizing popovers.
It records total CPU and style recalculation time and checks both budgets in default and Mastra skins.
Run `bun run test:browser e2e/color-picker-performance.pw.ts` for complete color drag gestures, text selection, and gradient keyboard behavior.
The tokenizer unit tests also verify that concurrent consumers share one cached result for identical source and language aliases.

React Compiler is enabled in the docs app. Start `NEXT_PUBLIC_REACT_SCAN=1 bun run dev` to enable React Scan;
use its toolbar to inspect which components rerender and how much render time they take. It is excluded from production.
Browser benchmarks set `window.__REACT_SCAN_DISABLED__`
and `window.__REACT_GRAB_DISABLED__` in an initialization script before navigation to prevent either tool from loading.

## Conventions

- Branches: `feat/…`, `fix/…`, or `chore/…`.
- No TypeScript `as` assertions except `as const`.
- Author colors in `oklch()`; prefer CSS-first solutions over React state for interaction and motion.
- Prefer clearer names over comments; remove comments that restate the code.

`AGENTS.md` carries repository working rules and architecture constraints. The generated consumer reference lives in `apps/docs/public/llms-full.txt`; it is not injected into repository instructions.
