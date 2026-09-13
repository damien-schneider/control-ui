# AGENTS.md

## Working here

- Work directly on `main`; create a branch only when the user explicitly requests one.
- When a branch is requested, use `chore/`, `fix/`, or `feat/`; never `codex/`.
- Do not commit or push unless explicitly asked. Prefer normal pushes over force-pushes.
- Prefer clearer names over comments; remove comments that restate the code.

## Architecture and design

- Reuse Control UI primitives, hooks, and blocks in the docs app and examples. Extend the shared source when behavior belongs to the component.
- Keep installable components runtime-neutral: plain props, children, and callbacks. The host application owns model calls, streaming, transport, and persistence; provider integrations belong in examples.
- Compose meaningful component parts instead of adding large prop bags or duplicating behavior in blocks.
- Share color, spacing, typography, radius, shadow, and motion tokens. Component recipes own visual defaults through registered `--cui-*` knobs; customize those knobs instead of competing paint declarations or `!important`.
- Keep one component implementation across skins. Theme values and appearance belong in CSS; skin config owns behavior choices and optional adornments.
- Author colors in `oklch()` and derived colors with relative syntax such as `oklch(from var(--x) l c h / a)`.
- Prefer CSS and native platform behavior for interaction, layout, sizing, and motion. Use JavaScript for stateful or async logic and unsupported behavior; guard limited CSS features with `@supports` and a working fallback.
- Use shared `--duration-*` and `--ease-*` tokens so motion respects reduced-motion settings.

## Source ownership

- Edit canonical component source in `apps/docs/src/registry/sources/control-ui`; shared hooks, utilities, blocks, examples, and skin packs live alongside it under `apps/docs/src/registry`.
- Product and documentation metadata lives in `apps/docs/app/(features)/catalog`. `apps/docs/scripts/registry-model.ts` derives install ownership and dependencies from the catalog and source imports.
- Manifests, `apps/docs/public/r`, the installed fixture in `apps/docs/components/control-ui`, and `packages/components/src` are generated. Change their source and regenerate; never edit the copies.
- Run `bun run sync` after registry source, catalog, or skin changes, and include the generated outputs with the source change. Keep this file hand-maintained; consumer catalogs and detailed authoring instructions belong in the docs.

## References and checks

- [CONTRIBUTING.md](CONTRIBUTING.md) lists setup and required checks; use focused behavior tests for the affected code and browser checks when the result depends on rendering.
- [Architecture](apps/docs/content/guides/architecture.mdx) explains component, runtime, and styling boundaries.
- [Repository layout](README.md#repository-layout) maps sources and generated outputs.
- [Consumer agent reference](apps/docs/public/llms-full.txt) contains registry discovery, installation, skin authoring, and detailed practice rules. Read the relevant section when needed.
