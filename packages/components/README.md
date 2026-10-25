# @ctrl-ui/react

Every Control UI component, block, and primitive with neutral defaults. The package contains no skin presets and needs no provider or skin config. Use the [registry](https://control-ui.dev/get-started) when you want to own and edit the component source.

## Install

```bash
bun add @ctrl-ui/react
```

Requires React 19 and Tailwind CSS v4. Wire the styles once in your global CSS:

```css
@import "tailwindcss";
@import "@ctrl-ui/react/styles/index.css";
@source "../node_modules/@ctrl-ui/react/dist";
```

## Use

```tsx
import { Button } from "@ctrl-ui/react/ui/button";

<Button>Save</Button>
```

Import paths mirror the registry tree. To ship less CSS, import `styles/theme.css` and only the recipes and effects your components use.

## Text and class names

Render text with `Text` and `Heading`. Size, tone, and weight are props; `className` carries layout only:

```tsx
import { Text } from "@ctrl-ui/react/ui/typography";

<Text size="caption" tone="muted">Saved</Text>
```

Merge class names with the package's `cn`. A bare `twMerge` reads `text-micro` as a text color and silently drops it next to `text-muted-foreground`. Add your own type rungs on top of `withControlUiMerge` instead of starting a second merger:

```ts
import { withControlUiMerge } from "@ctrl-ui/react/lib/cn";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({ extend: { classGroups: { "font-size": [{ text: ["hero"] }] } } }, withControlUiMerge);
```

Controls size their own text: pick the control's `size`, or set its `--cui-*-font-size` knob in your theme, rather than wrapping the label in a `text-*` span.

## Lint rules

Two rules keep call sites honest, shipped for Biome, ESLint, and oxlint from one policy (`lint/class-policy.mjs`):

- `no-component-style-classes` errors when `className` on a component imported from `@ctrl-ui/react` (or a `components/control-ui` directory) sets what the component owns: colors, type, padding, borders, radius, shadows, state styles such as `hover:` and `data-[…]:`, or `!important`. Every `text-*` class counts except alignment and wrapping (`text-center`, `text-pretty`, `text-ellipsis`…). The rule also reads string constants the `className` references in the same file, and the `className` of the element passed to the component's `render` prop. Layout classes (`flex`, `gap-*`, widths, heights, margins, placement) stay allowed. Restyle through the component's props or its `--cui-*` knobs instead.
- `no-raw-type-classes` errors on text sizes in any `className`: the type rungs, Tailwind's `text-xs`…`text-9xl`, and arbitrary `text-[13px]`. It reaches beyond Control UI, so adopt it folder by folder while you migrate.

The Biome rules need Biome 2.4.11 or later; older versions fail with "Failed to compile the Grit plugin".

Biome, extending the shipped preset so rules added later arrive with the package update:

```json
{
  "extends": ["@ctrl-ui/react/biome"],
  "overrides": [{ "includes": ["src/features/**"], "plugins": ["./node_modules/@ctrl-ui/react/lint/no-raw-type-classes.grit"] }]
}
```

ESLint flat config:

```js
import controlUi from "@ctrl-ui/react/eslint-plugin";

export default [{ plugins: { "control-ui": controlUi }, rules: { "control-ui/no-component-style-classes": "error" } }];
```

oxlint, through its JS plugin support:

```json
{ "jsPlugins": ["@ctrl-ui/react/eslint-plugin"], "rules": { "control-ui/no-component-style-classes": "error" } }
```

When your app imports components through its own wrapper package or folder, declare that path so the rule follows those imports too:

```js
rules: { "control-ui/no-component-style-classes": ["error", { importSources: ["@acme/ui/components/"] }] }
```

Biome's Grit plugins take no options, so the package ships `control-ui-grit` to write the rules with your paths. Run it on install so a package update regenerates them, gitignore `.control-ui`, and list `./.control-ui/no-component-style-classes.grit` under `plugins` in place of the preset:

```json
{ "scripts": { "postinstall": "control-ui-grit --import-source=@acme/ui/components/ --out=.control-ui" } }
```

## Customize

Your application owns its theme. Override the library's neutral defaults in your CSS:

```css
:root {
  --primary: oklch(0.45 0.18 260);
  --radius: 4px;
}
.dark {
  --primary: oklch(0.78 0.1 260);
}
```

Component knobs customize one instance:

```tsx
<Button style={{ "--cui-button-radius": "4px" }}>Save</Button>
```

For scoped themes, behavior choices, or adornments, pass your own `ControlUiSkin` to the optional provider. Define configurations containing render functions in a client module:

```tsx
"use client";

import type { ReactNode } from "react";
import type { ControlUiSkin } from "@ctrl-ui/react/skin";
import { SkinProvider } from "@ctrl-ui/react/skin-provider";

const skin: ControlUiSkin = { id: "acme", indicators: { sidebar: "hover" } };

export function AppTheme({ children }: { children: ReactNode }) {
  return <SkinProvider skin={skin}><div data-skin="acme">{children}</div></SkinProvider>;
}
```

Scope the corresponding CSS to `[data-skin="acme"]`. Portalled surfaces carry the provider's id, so they receive the same theme. With no provider, portals inherit the root theme. Each provider owns its subtree; there is no global skin singleton.

## Optional peers

Install a peer only when you import the component that needs it.

| Component | Peer |
| --- | --- |
| `ui/calendar` | `react-day-picker` |
| `ui/chart` | `@tanstack/charts` |
| `ui/code`, `ui/code-diff` | `@tanstack/react-virtual`, `diff`, `shiki` |
| `ui/command` | `cmdk` |
| `ui/flow` | `@xyflow/react` |
| `ui/markdown` | `streamdown` |
| `ui/phone-input` | `react-phone-number-input`, `libphonenumber-js`, `zod` |
| `ui/resizable` | `react-resizable-panels` |
| `chat-composer` | `prosemirror-*` |
| `email/email`, `email/templates` | `react-email` |

`ui/flow` also needs the React Flow structural stylesheet, loaded under the recipes:

```css
@import "@xyflow/react/dist/base.css" layer(base);
```
