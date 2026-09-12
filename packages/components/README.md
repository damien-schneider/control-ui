# @ctrl-ui/react

Every Control UI component, block, and primitive with the Refined skin, as a versioned package. Same source as the registry, built from the `all-refined` install set. Prefer the [registry](https://control-ui.dev/get-started) when you want to own and edit the source or run another skin.

## Install

```bash
bun add @ctrl-ui/react
```

Requires React 19 and Tailwind CSS v4. Wire the styles once in `app/globals.css`:

```css
@import "tailwindcss";
@import "@ctrl-ui/react/styles/index.css";
@source "../node_modules/@ctrl-ui/react/dist";
```

Stamp the skin on the root element:

```tsx
<html lang="en" data-skin="refined">
```

## Use

Import paths mirror the registry tree, so any docs example works after replacing `@/components/control-ui/` with `@ctrl-ui/react/`.

```tsx
import { ChatMessage } from "@ctrl-ui/react/chat-message";
import { Button } from "@ctrl-ui/react/ui/button";
```

`styles/index.css` imports every recipe. To ship less CSS, import the four base sheets and only the recipes you use:

```css
@import "@ctrl-ui/react/styles/theme.css";
@import "@ctrl-ui/react/styles/effects.css";
@import "@ctrl-ui/react/styles/skin-theme.css";
@import "@ctrl-ui/react/styles/skin.css";
@import "@ctrl-ui/react/styles/recipes/button.css";
```

## Customize

Override tokens after the imports, and tune a component through its typed knobs:

```css
[data-skin="refined"] {
  --cui-accent: oklch(0.6 0.2 260);
}
```

```tsx
<Button style={{ "--cui-button-radius": "4px" }}>Save</Button>
```

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
