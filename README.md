# Control UI Registry

A registry-first, shadcn-compatible UI system for production agent interfaces.

Control UI is distributed as editable source through the shadcn CLI. There is no runtime UI package and no provider lock-in: components accept plain props and children, while Mastra and AI SDK examples show how host applications map their own data into those contracts.

## Why this architecture

- shadcn ownership: installed files live in the consumer's repository and remain fully editable.
- One component implementation: skins change tokens, typed slots, CSS, and optional adornments; they never fork component behavior or markup.
- Granular installs: every documented agent and primitive has its own registry item, while `chat` and `chat-block` provide convenient dependency bundles.
- Safe coexistence: Control UI installs under `components/control-ui/*` and never overwrites `components/ui/*`.
- Portable targets: registry files use shadcn's `@components` placeholder, so both root and `src/` application layouts resolve correctly.
- Runtime neutrality: streaming, persistence, model calls, tools, and transport stay in the host application.

## Workspace

- `apps/docs/src/registry/sources/control-ui`: canonical component and primitive source.
- `apps/docs/src/registry/hooks` and `lib`: shared local behavior and utilities.
- `apps/docs/src/registry/blocks`: composed, installable recipes.
- `apps/docs/src/registry/skin-packs`: additive skin tokens, CSS, and typed slot configuration.
- `apps/docs/app/docs-catalog`: product and documentation metadata.
- `apps/docs/scripts/registry-model.ts`: install graph, file ownership, targets, and dependency derivation.
- `apps/docs/registry`: generated source manifests for review and local tooling.
- `apps/docs/public/r`: generated, content-inlined shadcn payloads served to consumers.
- `apps/docs/components/control-ui`: generated installed fixture used by the docs app.

The docs catalog describes the product surface. The registry model derives delivery metadata from that catalog and the real import graph. Generated manifests, public payloads, fixture files, API metadata, agent docs, and `llms.txt` are outputs, not competing sources of truth.

## Development

```bash
bun install
bun run dev
bun run sync
bun run validate
bun run typecheck
bun run lint
bun run doctor
bun run build
```

`bun run dev` serves the docs at `http://127.0.0.1:3000` and keeps the installed fixture synchronized. Run `bun run sync` after changing catalog or registry source; drift checks live in `bun run validate` and run in CI together with typecheck, lint, tests, and build.

Tests run from the docs workspace: `cd apps/docs && bun test` (plus `bun run test:browser` for Playwright suites). No environment variables are required locally; optional ones are documented in `apps/docs/.env.example`, and production deployments resolve the canonical URL from `NEXT_PUBLIC_SITE_URL` or Vercel's `VERCEL_PROJECT_PRODUCTION_URL`.

## Install

Install one surface:

```bash
npx shadcn@latest add http://127.0.0.1:3000/r/chat-message.json
npx shadcn@latest add http://127.0.0.1:3000/r/activity.json
```

Install a dependency bundle or complete block:

```bash
npx shadcn@latest add http://127.0.0.1:3000/r/chat.json
npx shadcn@latest add http://127.0.0.1:3000/r/chat-block.json
```

Install a skin without replacing component source:

```bash
npx shadcn@latest add http://127.0.0.1:3000/r/skin-modern-apple.json
```

### Upgrade from contract version 3

Contract version 4 replaces the removed ToolCall source with the typed Activity tool variant. Reinstalling registry items
does not delete files already copied into your application, so remove both possible install layouts first:

```bash
rm -f components/control-ui/tool-call.tsx components/control-ui/hooks/use-tool-call.ts
rm -f src/components/control-ui/tool-call.tsx src/components/control-ui/hooks/use-tool-call.ts
```

Then reinstall core, Activity, your selected components or block, and your skin. For example:

```bash
npx shadcn@latest add http://127.0.0.1:3000/r/core.json
npx shadcn@latest add http://127.0.0.1:3000/r/activity.json
npx shadcn@latest add http://127.0.0.1:3000/r/skin-refined.json
```

Replace `<ToolCall name="read_file" state={state}>` with `<Activity kind="tool" name="read_file" state={state}>`.
Use the matching `ActivityTrigger`, `ActivityRow`, `ActivityIcon`, `ActivityTitle`, `ActivityStatus`, and `ActivityContent`
parts. Replace `ToolCallInput` and `ToolCallOutput` with `ActivityDetail`, `ActivityDetailLabel`, and
`ActivityDetailContent`. Delete `useToolCall`; map provider status directly to `ActivityState`.

Each item includes the exact stylesheet imports it needs. The common baseline is:

```css
/* app/globals.css or src/app/globals.css */
@import "tailwindcss";
@import "../components/control-ui/styles/theme.css";
@import "../components/control-ui/styles/effects.css";
```

`public/r/registry.json` is the official shadcn registry catalog. `public/r/agent-index.json` is the richer agent-facing index, and `/api/registry` exposes the same product catalog with readable source and dependency metadata.

## Validation guarantees

`bun run validate` verifies:

- source manifests, built payloads, fixtures, docs, and agent surfaces have no generated drift;
- every public payload passes the official shadcn schema and includes current file content;
- every registry import is satisfied by its transitive dependency closure;
- install targets have one owner, except the intentional files replaced by a skin pack;
- catalog entries resolve to real granular registry items;
- registry source remains runner-agnostic and never writes into the host's shadcn tree;
- skin packs contain their required files and blocks compose documented surfaces.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, the generated-files workflow, and the checks a PR must pass.

## License

Licensed under the [MIT license](./LICENSE).
