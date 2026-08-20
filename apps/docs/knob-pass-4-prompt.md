# Pass 4: knobs inherit — delete the transport layer

You are working in `apps/docs` of the control-ui monorepo, branch `feat/css-knob-architecture`.
Passes 1–3 moved all paint into `recipes/*.css` and rationed knobs (1405 → 440 `@property`).
One rule from the original prompt (rule 5, `inherits: false`) was calibrated on the single-element
Button pilot and does not scale to multi-slot families. It is the root of every remaining piece of
noise: `var(--_x, var(--x))` paint fallbacks (181), the JS `transportKnobStyle`/`pickKnobStyle`
mirror in 28 files, `::placeholder` "paint variables", ~200 lines of transport/ownership tests, and
278 per-slot knob arrays + 339 style types in `contracts.ts` (1440 → 3007 lines, shipped in core).

This pass supersedes rule 5 and tightens rules 1, 2 and 6 of `knob-migration-prompt.md`
(already edited to match). Do the whole sweep in one go, tests flipped first, no dual-mode.

## The model after this pass

```
recipe root rule   declares every knob default of the family (+ paints the root)
slot rules         read `var(--<family>-x)` bare — no private fallback, no mirror
@property          inherits: true, typed syntax, initial-value = inert value
skins              re-value knobs on the family root; per-slot only for state-specific overrides
consumers          style / className / globals on the ROOT — cascade carries it to every slot
TSX                stamps data-control-family on every painted element; passes `style` untouched
```

Cascade, verified in a rendered fixture (Chromium, 2026-08-18) — every case below is exact:

| case | result |
| --- | --- |
| recipe default on root, shell reads `var(--x)` | default applies |
| `style={{ "--x": "1px" }}` on root | shell = 1px (no JS) |
| `className="[--x:0]"` on root (utilities layer) | shell = 0 — **silent no-op today** |
| skin sets `--x` on root (skin after recipe, same layer) | wins over default |
| skin on root + inline on root | inline wins (consumer > skin > recipe) |
| skin on **slot** + inline on root | skin wins — the one trade; hence "skins on root" |
| same family nested, outer inline | inner root re-declares defaults → isolated |
| invalid value on shell (`--x: bogus`, typed) | falls back to the inherited root value |
| `::placeholder { color: var(--x) }` | inherits from the textarea, no paint variable |
| unset outside any family | `initial-value` |

Portals are unchanged (a portaled popup is not a descendant; it stays its own family root).

## Reference: `recipes/chat-composer.css` after the pass

Imitate this shape exactly for every recipe.

```css
@layer components {
  :where([data-control-family="chat-composer"][data-slot="root"]) {
    --chat-composer-root-background: oklch(from var(--background) l c h / 0.8);
    --chat-composer-shell-background: oklch(from var(--card) l c h / 0.78);
    --chat-composer-shell-border-color: var(--border);
    --chat-composer-shell-radius: var(--radius-field);
    --chat-composer-shell-shadow: var(--shadow-sm);
    --chat-composer-input-foreground: var(--foreground);
    --chat-composer-input-placeholder-foreground: var(--muted-foreground);
    --chat-composer-mention-background: oklch(from var(--primary) l c h / 0.1);
    background: var(--chat-composer-root-background);
  }

  @supports (backdrop-filter: blur(1px)) {
    :where([data-control-family="chat-composer"][data-slot="root"]) {
      --chat-composer-root-background: oklch(from var(--background) l c h / 0.7);
      backdrop-filter: blur(var(--backdrop-blur-popover));
    }
  }

  :where([data-control-family="chat-composer"][data-slot="shell"]) {
    border: 1px solid var(--chat-composer-shell-border-color);
    border-radius: var(--chat-composer-shell-radius);
    background: var(--chat-composer-shell-background);
    box-shadow:
      inset 0 0 0 1px oklch(from var(--foreground) l c h / 0.04),
      var(--chat-composer-shell-shadow);
    transition-property: box-shadow, filter, translate;
    transition-duration: var(--duration-base);
    transition-timing-function: var(--ease-emphasized);
  }

  :where([data-control-family="chat-composer"][data-slot="shell"][data-state="submitting"]) {
    translate: 0 -0.125rem;
    filter: saturate(1.02);
    box-shadow:
      inset 0 0 0 1px oklch(from var(--foreground) l c h / 0.04),
      var(--shadow-md);
  }

  :where([data-control-family="chat-composer"][data-slot="accent"]) {
    background-image: linear-gradient(to right, transparent, oklch(from var(--foreground) l c h / 0.2), transparent);
  }

  :where([data-control-family="chat-composer"]:is([data-slot="textarea"], [data-slot="fallback"], [data-slot="placeholder"]),
    [data-control-family="chat-composer"][data-slot="editor"] .ProseMirror) {
    font-size: var(--text-sm);
    line-height: calc(var(--spacing) * 6);
    outline: none;
  }

  :where([data-control-family="chat-composer"]:is([data-slot="textarea"], [data-slot="fallback"])) {
    border: 0;
    background: transparent;
    color: var(--chat-composer-input-foreground);
  }

  :where([data-control-family="chat-composer"]:is([data-slot="textarea"], [data-slot="fallback"]))::placeholder,
  :where([data-control-family="chat-composer"][data-slot="placeholder"]) {
    color: var(--chat-composer-input-placeholder-foreground);
  }

  :where([data-control-family="chat-composer"][data-slot="textarea"]:disabled) {
    opacity: 0.6;
  }

  :where([data-control-family="chat-composer"]:is([data-slot="tools"], [data-slot="footer"], [data-slot="mention-description"])) {
    color: var(--muted-foreground);
  }

  :where([data-control-family="chat-composer"][data-slot="footer"]) {
    font-size: var(--text-caption);
  }

  :where([data-control-family="chat-composer"][data-slot="mention-description"]) {
    font-size: var(--text-micro);
  }

  :where([data-control-family="chat-composer"][data-slot="mention"]) {
    border-radius: var(--radius-popup-item);
    background: var(--chat-composer-mention-background);
    color: var(--primary-text);
    font-weight: var(--font-weight-medium);
  }

  :where([data-control-family="chat-composer"][data-slot="mention-icon"]) {
    border-radius: 3px;
  }
}

@property --chat-composer-root-background {
  syntax: "<color>";
  inherits: true;
  initial-value: transparent;
}
/* …one block per knob, all `inherits: true`, same multiline format… */
```

What changed versus today, and why:

- Defaults moved from each slot to the root rule; slots read the knob bare. `inherits: true`
  carries the value; no `--_x` mirror, no `var(--_x, var(--x))`, no `--_…-paint` for pseudo-elements,
  no `--_chat-composer-shell-active-translate` relay (a literal in the state rule is fine).
- Selectors key on `data-control-family` only. `:where(:is([data-control-ui="x"], [data-control-family="x"])…)`
  was a hedge; the recipe key is the family, always. `data-control-ui` stays the identity attribute
  (skins, adornments, tests, devtools) and never appears in a recipe selector.
- The three identical editor blocks collapsed into grouped selectors; the editor's `fallback` /
  `placeholder` / `editor` slots join the family (they already stamp `data-control-family="chat-composer"`).

## Sweep

1. **Tests first** — `src/registry/skin-packs/control-knob-contract.test.ts`:
   - delete the `knob style transport` describe, the `aggregate knob style ownership` describe, the
     inline-citation transport test, `transportedKnobsWithoutPrivateBridge`, `aggregateStylePlacements`,
     `unplacedAggregateKnobs`, `aggregateOwnerSelectors` and their helpers;
   - flip `every knob ships a default and intentional @property inheritance` → every public knob is
     registered `inherits: true` and its default is declared in the family root rule
     (`[data-slot="root"]`, or the family's single element for mono-slot families like button/badge);
   - flip `rejects inheriting public knob registrations` → `rejects non-inheriting public knob registrations`;
   - replace `public knobs are consumed on their owning element` with `every public knob is read
     somewhere in its recipe` (dead-knob lint — knobs nobody paints with are deleted, not kept);
   - keep `private inheritance bridges stay absent`, `custom properties never form same-element
     cycles`, motion, grammar, `:where()` wrapper lints; add `public knobs are never read through a
     private fallback` (reject `var(--_x, var(--x))` and `var(--_x,var(--x))` for any contract knob);
   - add `recipe selectors key on data-control-family` (reject `data-control-ui=` inside `recipes/*.css`)
     and make `every family source stamps its semantic identity` require `data-control-family="<family>"`;
   - negative-test each new/flipped lint once (inject, watch it fail with the exact line, restore).
2. **Recipes (76 files)** — apply the reference shape: defaults to root, bare reads, `inherits: true`,
   family-only selectors, delete every `--_x: var(--x)` mirror and every `var(--_x, var(--x))`.
   Private `--_` variables remain legal only as internal helpers (e.g. badge's per-color table
   `--_badge-color-*` feeding knob defaults) — never as a transport for a public knob.
   `dynamic-notification-motion.css` already uses `inherits: true`; align its format.
3. **`contracts.ts`** — one knob array + one style type per family (`chatComposerKnobs`,
   `ChatComposerKnobStyle`); delete per-slot arrays/types (`…RootKnobs`, `…ShellKnobs`,
   `KnobStyleMatching`, `WithKnobStyle`), delete `transportKnobStyle` and `pickKnobStyle`. Families
   with a real separate contract (e.g. `chat-composer-attachment`) keep their own array. Target: well
   under 2000 lines.
4. **TSX (28 files)** — pass `style` straight (`style={style}` or just spread), type it
   `CSSProperties & <Family>KnobStyle` on the root **and** on slots (any knob is valid on any slot —
   cascade decides), stamp `data-control-family="<family>"` on every painted element in addition to
   `data-control-ui`. Public props API unchanged.
5. **Skins (8 packs)** — move knob re-values to the family root selector; keep per-slot rules only
   for state-specific overrides and non-knob decor (rig's `::before/::after` ticks stay). Port the
   chat-composer skin rules that `@apply` paint directly on `shell`/`mention` (cuicui, linear,
   modern-apple, xp) to knob re-values on root — today they bypass the contract, so a consumer's
   `--chat-composer-shell-radius` dies silently under those skins. Doctor (`validate-skins.ts`)
   still rejects unknown knobs and `@property` in skins.
6. **Docs/generated** — `bun run sync` regenerates the CSS custom-data and skin contract; check
   the docs "Knobs" examples still demonstrate root-level `style` and `md:[--…]` overrides.

## Verification loop (after every family, not at the end)

```
bun run sync && bun run validate && bun run typecheck && bun test && bun run test:install
```

Browser pass on chat-composer, badge, select/popup, toast: `<ChatComposer className="[--chat-composer-shell-radius:0]">`
now rounds the shell to 0; under cuicui the same override still wins; 8 skins visually intact;
zero console errors.

## Definition of done

```
rg -c "inherits: false" src/registry/sources/control-ui/recipes/            → 0
rg -c 'var\(--_[a-z0-9-]+,\s*var\(--' src/registry/sources/control-ui/recipes/ → 0
rg -c 'data-control-ui=' src/registry/sources/control-ui/recipes/          → 0
rg -l "transportKnobStyle|pickKnobStyle|KnobStyleMatching|WithKnobStyle" src → empty
wc -l src/registry/contracts.ts                                             → < 2000
bun test / validate / typecheck / test:install                              → green
```

Code standards from the original prompt apply unchanged (zero comments, no `as` casts, files under
~400 lines, no commit unless asked, no AI attribution anywhere).
