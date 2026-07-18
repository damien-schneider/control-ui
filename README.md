# Control UI

Production-ready, shadcn-compatible React components, blocks, and skins for agent interfaces, distributed as editable source.

[![CI](https://github.com/damien-schneider/control-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/damien-schneider/control-ui/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Documentation](https://img.shields.io/badge/docs-control--ui.dev-black.svg)](https://control-ui.dev)

[Documentation](https://control-ui.dev) · [Get started](https://control-ui.dev/get-started) · [Browse components](https://control-ui.dev/overview) · [Report an issue](https://github.com/damien-schneider/control-ui/issues)

Control UI is an owned-source registry for building AI chat, coding-agent, and operational interfaces. Install only the surfaces you need with the shadcn CLI, then adapt the source in your application. There is no runtime UI package and no provider lock-in.

> [!NOTE]
> Control UI is currently in alpha. Stable, beta, and experimental items are labeled in the catalog; beta and experimental APIs may change.

> [!IMPORTANT]
> Upgrading from contract version 3? Contract version 4 replaces `ToolCall` with Activity's typed tool variant. Follow the [migration steps](https://control-ui.dev/get-started#install-a-skin) before reinstalling components or a skin.

Remove the legacy files before reinstalling:

```bash
rm -f components/control-ui/tool-call.tsx components/control-ui/hooks/use-tool-call.ts
rm -f src/components/control-ui/tool-call.tsx src/components/control-ui/hooks/use-tool-call.ts
```

## Why Control UI

- **Own the source.** Components are copied into your repository and remain fully editable.
- **Bring any runtime.** Plain props and children keep model calls, streaming, persistence, and transport in your application.
- **Skin the whole system.** One component implementation supports complete token-driven skins without forking behavior or markup.
- **Install at the right level.** Choose a primitive, an agent surface, a complete block, or a dependency bundle.
- **Coexist with shadcn/ui.** Control UI installs under `components/control-ui/*` and does not overwrite `components/ui/*`.
- **Use root or `src/` layouts.** Registry targets resolve through the consumer's configured shadcn aliases.

## Quick start

Start with a React application configured for shadcn and Tailwind CSS v4.

### 1. Install a skin and component

```bash
npx shadcn@latest add https://control-ui.dev/r/skin-refined.json
npx shadcn@latest add https://control-ui.dev/r/chat-message.json
```

A skin is required because it owns the complete visual token contract. Installing another skin replaces the active skin files without replacing component source.

### 2. Import the generated styles

Add the imports once in `app/globals.css` or `src/app/globals.css`:

```css
@import "tailwindcss";
@import "../components/control-ui/styles/theme.css";
@import "../components/control-ui/styles/effects.css";
@import "../components/control-ui/styles/skin-theme.css";
@import "../components/control-ui/styles/skin.css";
```

### 3. Activate the skin

```tsx
import type { ReactNode } from "react";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-skin="refined">
      <body>{children}</body>
    </html>
  );
}
```

### 4. Render the component

```tsx
import type { ReactNode } from "react";

import {
  ChatMessage,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageRow,
} from "@/components/control-ui/chat-message";

export function AssistantMessage({ children }: { children: ReactNode }) {
  return (
    <ChatMessage from="assistant">
      <ChatMessageRow>
        <ChatMessageBody>
          <ChatMessageContent>{children}</ChatMessageContent>
        </ChatMessageBody>
      </ChatMessageRow>
    </ChatMessage>
  );
}
```

For a complete chat composition, install the block instead:

```bash
npx shadcn@latest add https://control-ui.dev/r/chat-block.json
```

See the [getting-started guide](https://control-ui.dev/get-started) for skin choices, provider integrations, CSS setup, and contract migrations.

## Explore the catalog

- [Agent surfaces](https://control-ui.dev/overview#agents) — messages, inputs, activities, attachments, code, and task UI.
- [Blocks](https://control-ui.dev/overview#blocks) — complete chat, coding-agent, settings, and file-explorer compositions.
- [Primitives](https://control-ui.dev/overview#primitives) — accessible controls and application building blocks.
- [Skins](https://control-ui.dev/skins) — complete visual systems sharing one component contract.
- [Agent-facing registry](https://control-ui.dev/r/agent-index.json) — machine-readable discovery, dependencies, and install commands.

## Architecture

The docs catalog describes the public product surface. The registry model derives delivery metadata from that catalog and the real import graph. Generated manifests, public payloads, installed fixtures, API metadata, agent docs, and `llms.txt` are outputs rather than competing sources of truth.

Control UI stays runtime-neutral: examples show how to map provider-owned data at the application boundary, but installed core files do not depend on Mastra, AI SDK, LangChain, or another model runner.

## Local development

### Requirements

- [Bun 1.3.5](https://bun.sh/) — use the version pinned in `package.json`.
- Node.js 24.x for parity with the hosted docs project.

### Setup

```bash
git clone https://github.com/damien-schneider/control-ui.git
cd control-ui
bun install
bun run dev
```

The docs app runs at `http://127.0.0.1:3000`. No environment variables are required for local development; optional values are documented in `apps/docs/.env.example`.

### Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Run the docs app and fixture sync watcher |
| `bun run sync` | Regenerate manifests, fixtures, public payloads, and agent docs |
| `bun run validate` | Check contracts, catalog data, registry payloads, and generated drift |
| `bun run typecheck` | Type-check the workspace |
| `bun run lint` | Run Biome lint |
| `bun run format:check` | Check formatting |
| `cd apps/docs && bun test` | Run the docs workspace test suite |
| `cd apps/docs && bun run test:browser` | Run Playwright browser tests |
| `bun run build` | Build the production docs app |

Run `bun run sync` after changing registry source, catalog metadata, or skin packs. Commit generated outputs with the source change.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `apps/docs/src/registry/sources/control-ui` | Canonical component and primitive source |
| `apps/docs/src/registry/hooks` and `lib` | Shared component behavior and local utilities |
| `apps/docs/src/registry/blocks/control-ui` | Composed installable blocks |
| `apps/docs/src/registry/skin-packs` | Skin tokens, CSS, typed slots, and optional adornments |
| `apps/docs/app/(features)/catalog` | Public product and documentation metadata |
| `apps/docs/scripts/registry-model.ts` | Install graph, targets, ownership, and dependency derivation |
| `apps/docs/registry` | Generated source manifests |
| `apps/docs/public/r` | Generated shadcn payloads served to consumers |
| `apps/docs/components/control-ui` | Generated installed fixture used by the docs app |

Do not edit generated manifests, payloads, or the installed fixture directly. Change the canonical source and run `bun run sync`.

## Contributing

Bug reports, feature proposals, documentation fixes, and component contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request, and use [GitHub Issues](https://github.com/damien-schneider/control-ui/issues) for reproducible bugs or scoped proposals.

## License

Control UI is available under the [MIT License](./LICENSE).
