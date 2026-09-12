import { preview, sourceFile } from "./shared";

export const emailEntry = {
  id: "email",
  kind: "Agent",
  name: "Email",
  status: "experimental",
  summary: "React Email compositions with Control UI colors and typography, image layouts, columns, and HTML or plain-text export.",
  registryKind: "email",
  paths: {
    example: sourceFile("Email gallery", "src/registry/examples/control-ui/email/preview.tsx", "example"),
    usage: {
      mastra: sourceFile("Server rendering", "src/registry/usage/components/email.tsx", "usage"),
      "ai-sdk": sourceFile("Server rendering", "src/registry/usage/components/email.tsx", "usage"),
    },
    source: sourceFile("Email components", "src/registry/sources/control-ui/email/email.tsx", "component"),
    supportFiles: [
      sourceFile("Theme adapter", "src/registry/sources/control-ui/email/theme.ts", "theme-adapter"),
      sourceFile("Five email templates", "src/registry/sources/control-ui/email/templates.tsx", "templates"),
      sourceFile("Email guide", "src/registry/sources/control-ui/email/README.md", "guide"),
    ],
  },
  preview: preview(() => import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailExample }))),
} as const;
