# @control-ui/skills

Typed practice notes for future Control UI generation and review helpers.

This package gives the repo a stable place for React quality, architecture, UI/Tailwind, UX, and registry guidance without mixing those concerns into the docs app or installable registry components.

Skill records live under `src/concerns/*`:

- `react-code-quality` includes Mastra-inspired React rules such as deriving instead of duplicating values, remounting state boundaries, using refs instead of DOM queries, splitting responsibilities through focused files and narrow APIs, testing the real stack, and proving visual behavior from rendered output instead of class strings.
- `architecture` covers canonical ownership, derived or generated projections, and drift checks that keep schemas, manifests, routes, docs, config, fixtures, and state aligned.
- `ui-tailwind` includes Mastra-inspired styling rules around existing component reuse, token discipline, className boundaries, and Tailwind v4 configuration, migration syntax, generated utilities, variants, capabilities, and behavior changes.
- `ux` covers product-surface checks such as state continuity, provenance cues, dense-but-scannable workflow design, and copy discipline against redundant AI-slop explanations.
- `control-ui` covers registry-first DX, complete skins, Control UI composition, runtime-agnostic UI boundaries, and compound component APIs.

For customizable surfaces, prefer anatomy-based parts over large prop bags. For integrations, keep runner mapping in usage examples or host-app functions and keep core UI renderable from plain props and children.
