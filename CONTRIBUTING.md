# Contributing

Thanks for helping improve Control UI.

## Setup

```bash
bun install
bun run dev
```

The docs app serves at `http://127.0.0.1:3000`. No environment variables are required for local work; optional ones live in `apps/docs/.env.example` (registry URL override, canonical site URL, search-engine verification tokens). The canonical URL resolves from `NEXT_PUBLIC_SITE_URL`, then Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, then `https://control-ui.dev`, so generated files committed from a local `bun run sync` carry the production origin.

Heads-up: the docs app tracks bleeding-edge tooling — Next.js preview releases and the TypeScript native preview (`typescript@7`). Use the pinned Bun version from `package.json` (`packageManager`) if a check behaves differently on your machine.

## Source of truth and generated files

Component and kit source lives in `apps/docs/src/registry/sources/control-ui`; the product catalog lives in `apps/docs/app/(features)/catalog`. Everything else registry-shaped is generated from those (see the Repository layout section of the README).

After changing registry source, catalog metadata, or skin packs:

```bash
bun run sync
```

Keep documentation-only sizing, spacing, and framing out of example source. Declare a layout with `preview(loader, { layout })` in the catalog: `full`, `centered`, `stack`, `grid`, or `contained`. The preview tabs and catalog gallery share these frames; component composition stays in the example. Use `description` in the same options object when the main preview needs explanation.

Preview modules start with `"use client"` and load as `import("…").then((mod) => ({ default: mod.ExportName }))`. `bun run sync` turns those loaders into static client references, which each docs page hands to its previews so they hydrate in place instead of falling back to a skeleton while their chunk loads.

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

Browser tests require Playwright browsers installed locally. In `apps/docs`, `bun run test:browser` runs the functional suite
on a quarter of the CPU cores against the dev server on port 3000, reusing one that is already running. Tests fail after 60 seconds, and actions
and assertions after 10; record a trace for a failure with `--trace on`.

Interaction benchmarks and full-site sweeps form the `audits` project, which runs one test at a time:
`bun run test:browser:audits`, or name files, e.g. `bun run test:browser:audits e2e/sidebar-performance.pw.ts e2e/dropdown-performance.pw.ts e2e/tabs-performance.pw.ts e2e/tabs-transition.pw.ts`.
These tests measure Chromium main-thread CPU time over repeated real pointer interactions, attach the samples to the test report,
and check warmed medians. Run them without other CPU-heavy checks. Tracing and development overlays are disabled for these measurements
so recorder and diagnostic work do not count against application budgets.
Tab coverage includes populated docs panels and a 200-item fixture, plus synchronized slides, height changes, keyboard navigation,
reduced motion, interrupted transitions, and retained example and scroll state.
`e2e/component-performance.pw.ts` covers 400-entry accordions, collapsibles, and resizing popovers.
It records total CPU and style recalculation time and checks both budgets in default and Mastra skins.
`e2e/color-picker-performance.pw.ts` covers complete color drag gestures, text selection, and gradient keyboard behavior.
The tokenizer unit tests also verify that concurrent consumers share one cached result for identical source and language aliases.
`e2e/search-performance.pw.ts` covers Cmd+K opening, filtering, clearing, and closing a populated search.
It uses direct keyboard events, checks CPU and style budgets, and verifies selection, scrolling, and query reset without limiting results.
`e2e/dropdown-hover-performance.pw.ts` covers pointer movement through 200-item selects, dropdown menus, and context menus.
It measures CPU, style work, React commits, and focus changes, and verifies disabled items, keyboard selection, and nested pointer targets.
`e2e/infinite-canvas-performance.pw.ts` checks that a 300-item canvas pans and zooms without rerendering items and writes the transform once per frame.
`e2e/contrast-sweep.pw.ts` renders every docs page across skins and modes and checks text contrast;
`e2e/sidebar-controls-contrast.pw.ts` checks the docs sidebar controls in every skin and mode.

React Compiler is enabled in the docs app. Start `NEXT_PUBLIC_REACT_SCAN=1 bun run dev` to enable React Scan;
use its toolbar to inspect which components rerender and how much render time they take. It is excluded from production.
React Scan never loads in browsers driven by automation (`navigator.webdriver`), so Playwright runs measure the app alone.

## Conventions

- Branches: `feat/…`, `fix/…`, or `chore/…`.
- No TypeScript `as` assertions except `as const`.
- Author colors in `oklch()`; prefer CSS-first solutions over React state for interaction and motion.
- Prefer clearer names over comments; remove comments that restate the code.

`AGENTS.md` carries repository working rules and architecture constraints. The generated consumer reference lives in `apps/docs/public/llms-full.txt`; it is not injected into repository instructions.
