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

Component and primitive source lives in `apps/docs/src/registry/sources/control-ui`; the product catalog lives in `apps/docs/app/docs-catalog`. Everything else registry-shaped is generated from those (see the Workspace section of the README).

After changing registry source, catalog metadata, or skin packs:

```bash
bun run sync
```

Commit the regenerated outputs together with your change. Generated files are marked `linguist-generated` so they stay collapsed in review; `bun run validate` fails on any drift between sources and outputs.

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

## Conventions

- Branches: `feat/…`, `fix/…`, or `chore/…`.
- No TypeScript `as` assertions except `as const`.
- Author colors in `oklch()`; prefer CSS-first solutions over React state for interaction and motion.
- Prefer clearer names over comments; remove comments that restate the code.

`AGENTS.md` carries the full working conventions (including the agent-facing registry surface) and is the reference when in doubt.
