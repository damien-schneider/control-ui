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
| `ui/code`, `ui/code-diff` | `@tanstack/react-virtual`, `diff`, `shiki` |
| `ui/command` | `cmdk` |
| `ui/markdown` | `streamdown` |
| `ui/phone-input` | `react-phone-number-input`, `libphonenumber-js`, `zod` |
| `ui/resizable` | `react-resizable-panels` |
| `chat-composer` | `prosemirror-*` |
| `email/email`, `email/templates` | `react-email` |
