# Mission: converge every control-ui component onto the CSS knob architecture

You are working in `apps/docs` of the control-ui monorepo, on branch `feat/css-knob-architecture`.
A pilot (Button + Toggle) is complete and verified — it is the exemplar. Your job is to migrate the
remaining ~90 components to the same architecture, all at once, with no legacy mechanism left.

Read these files first; they ARE the spec, imitate them exactly:

- `src/registry/sources/control-ui/ui/button.tsx` — structure-only TSX stamping data-attributes
- `src/registry/sources/control-ui/recipes/button.css` — paint recipe + `@property` registrations
- `src/registry/contracts.ts` — SSOT arrays (`buttonVariants/Tones/Shapes/Knobs`)
- `src/registry/skin-packs/button-knob-contract.test.ts` — the test suite every family must get
- `src/registry/skin-packs/cuicui/skin.css` and `xp/skin.css` — how skins re-value knobs
- `scripts/validate-skins.ts` — the doctor (knob validation, levenshtein suggestions)
- `scripts/registry-model.ts` — registry wiring (coreFiles, sourceTargetRoots, registryCss)
- `scripts/test-registry-install.mjs` — the shadcn-compatibility smoke test

## Architecture rules (non-negotiable)

1. **TSX = structure and behavior only.** Components stamp `data-control-ui="<component>"`
   (identity), `data-control-family="<family>"` (recipe key, on every painted element),
   `data-slot`, and their semantic props as data-attributes (`data-variant`, `data-tone`,
   `data-size`, `data-shape`, `data-active`, ...). Layout/dimension classes stay in TSX
   (flex, gap, sizing via `control-variants.ts`); paint (colors, shadows, radius, borders,
   motion) never does.
2. **Paint lives in per-family recipe CSS** at `src/registry/sources/control-ui/recipes/<family>.css`.
   All rules inside `@layer components`, all selectors wrapped in `:where()` for zero specificity,
   keyed on `data-control-family` + `data-slot` (+ state/variant attributes) — never on
   `data-control-ui`. `className` must always win through layer order — never
   `!important`, never specificity escalation.
3. **One recipe file = one knob contract = one family that skins alike.** `button.css` hosts
   button + toggle. Components that skin identically share a family; a component needing its own
   contract gets its own file. Do not create a catch-all `control.css`.
4. **Knobs are rationed.** `--<family>-<property>` custom properties, defaults chained to the
   semantic tokens in `theme.css` (`var(--primary)`, `--radius`, ...). States are selectors
   (`:hover`, `[data-active]`), NOT extra knobs — no knob-per-state×variant explosion.
   Private helpers use `--_` prefix and stay out of the contract.
5. **Every public knob registers with `inherits: true` via `@property` in its recipe file**
   (typed syntax where the spec has a type, `syntax: "*"` for shadow lists, inert `initial-value`).
   Defaults live in the family ROOT rule; slots read `var(--<family>-x)` bare — no `--_x` mirror,
   no `var(--_x, var(--x))` fallback, no JS style transport. Skins re-value knobs on the family
   root (per-slot only for state-specific overrides); consumers set knobs on the root through
   `style`, `className` or globals and the cascade carries them to every slot. Skins never declare
   `@property` — the doctor rejects it. See `knob-pass-4-prompt.md` for the verified cascade table.
6. **SSOT in `contracts.ts`**: `as const` arrays per family (`<family>Variants`, `<family>Tones`,
   ONE `<family>Knobs`, ...), types derived from them, and ONE typed per-instance style
   (`CSSProperties & <Family>KnobStyle`) accepted on the root and on every slot — no per-slot
   arrays or types, no runtime knob helpers.
7. **Every family gets the contract test suite** (copy the button pattern): every variant/tone
   painted beyond the base; only declared variants/tones targeted by core and skins; every knob has
   a default and an `@property`; only contract knobs referenced anywhere; no literal duration/easing
   in recipes (motion rides `--duration-*`/`--ease-*` tokens only); contract names follow the
   naming grammar. Negative-test every new lint once: inject a violation, watch it fail with the
   exact line, restore.
8. **Skins are pure CSS.** Port every remaining JS skin slot (`skinSlot`/`skinPaint` classes and
   `slots.<component>` config entries) to knob re-values + descendant CSS in the 8 skin packs, then
   delete the dead JS: dead `slots` entries, dead `skinSlot` call sites (including the no-op
   `skinSlot("button", ...)` calls left in button.tsx), and whatever in `skin.ts` becomes
   unreachable. No legacy mechanism survives this migration.
9. **Adornments stay JSX, through typed anchors** (`SkinAdornmentContexts`). CSS can't inject
   elements — be generous adding anchors (layer, glow, indicator) while sweeping; they are the
   escape hatch that keeps forks unnecessary.
10. **Extension without fork stays intact**: `{...props}` spread lets consumers pass invented
    `data-*` (painted in their own globals.css — never in skins); responsive knob overrides work via
    arbitrary properties (`md:[--button-radius:...]`); consumer utilities always beat recipes.
11. **Platform constraints**: no `if()`, no `@function`, no typed `attr()` (Chrome-only in 2026).
    Use `@starting-style` + `transition-behavior: allow-discrete` for popover/menu/dialog
    enter-exit. Convert physical properties to logical ones (RTL) in every file you touch.
12. **Model B — do this FIRST**: recipes ship with their component item, not with core.
    In `registry-model.ts`: remove the recipe from `coreFiles`, attach each recipe file to every
    item of its family (target dedup by path+target already exists), drop the static
    `@import "./recipes/button.css"` from `theme.css`, and let `registryCss()` inject per-item
    imports (flip its `/styles/recipes/` exclusion). Core must stay at 9 files forever.
    `test-registry-install.mjs` asserts recipes land in installed apps — keep it green and extend
    its assertions to new families as you go.

## Sweep order

1. Model B switch (rule 12) while the surface is one recipe file.
2. One hard surface family first to pressure-test assumptions: **select/popover/menu**
   (portals, open/close states, sub-slots). Verify in the browser before continuing.
3. Inputs family (input, textarea, checkbox, radio, switch, slider).
4. Surfaces (card, dialog, sheet, tooltip, tabs).
5. The long tail, mechanically.
6. Final pass: `rg -l "skinSlot|skinPaint" src/registry` must return nothing; delete the dead
   machinery from `skin.ts` and the `slots` type surface.

## Per-component checklist

- [ ] TSX stamps data-attrs; paint classes removed; typed `style` knob prop added
- [ ] Recipe file (or joined family recipe) with `@layer components` + `:where()` + `@property`
- [ ] Contract arrays + derived types in `contracts.ts`
- [ ] Contract test suite passes and was negative-tested
- [ ] All 8 skin packs ported for this component (tokens-only skins need zero lines — verify, don't force)
- [ ] Registry manifest updated; recipe attached to the item; smoke test green
- [ ] Docs catalog `supportFiles` declares the recipe for the component's page
- [ ] `bun run sync` clean; VS Code custom-data regenerated (`sync:cssdata`)

## Verification loop (after every family, not at the end)

```
bun run sync && bun run validate && bun run typecheck && bun test && bun run test:install
```

Plus browser verification per hard family (dev server, check painted styles, skin cascade,
per-instance knobs, zero console errors). E2E: `bun run test:e2e` must stay green.

## Code standards

- Zero comments target; a comment only for a constraint code cannot express, one line.
- No `as` casts (`as const` OK). Derive types from the contract arrays.
- Files under ~400 lines — split recipe files per family, never one giant CSS.
- Biome + typecheck clean on every touched package before moving on.
- Do not commit unless the session owner asks; never add any AI attribution anywhere.
- Public component props API must not change — `variant`/`tone`/`size` props keep working
  identically; only the transport (classes → data-attrs + CSS) changes.

## Definition of done

`rg -l "skinSlot|skinPaint" src/registry` empty · all families have recipes + contracts + tests ·
8 skins visually intact (browser pass) · smoke test green · 535+ tests green · validate green ·
core = 9 files · docs pages show each component's recipe with the shared badge logic intact.
