import { type CatalogNamedPreview, preview, sourceFile } from "./shared";

const harnessModule = "src/registry/examples/control-ui/email/preview.tsx";

const exampleFile = (label: string, name: string) =>
  sourceFile(label, `src/registry/examples/control-ui/email/messages/${name}.tsx`, "example");

const additionalPreviews: CatalogNamedPreview[] = [
  {
    id: "announcement",
    title: "Announcement",
    description: "Marketing send: hero image, one call to action, and the unsubscribe and preference links its footer requires.",
    source: exampleFile("Announcement email", "announcement"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailAnnouncementPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "release-notes",
    title: "Release notes",
    description: "Versioned changelog grouped into New, Improved, and Fixed with EmailBulletList.",
    source: exampleFile("Release notes email", "release"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailReleaseNotesPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "editorial",
    title: "Image and text",
    description: "Two-column Row and Column layout with a percentage-width image beside the story.",
    source: exampleFile("Editorial email", "editorial"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailEditorialPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "newsletter",
    title: "Newsletter",
    description: "Repeated article sections above the full marketing footer.",
    source: exampleFile("Newsletter email", "newsletter"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailNewsletterPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "summary",
    title: "Summary",
    description: "Metric row plus EmailDetailRow lines for a recurring digest.",
    source: exampleFile("Summary email", "summary"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailSummaryPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "verification",
    title: "Verification code",
    description:
      "Transactional send: EmailCode for the one-time code, and a footer that identifies the sender without an unsubscribe link.",
    source: exampleFile("Verification email", "verification"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailVerificationPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "receipt",
    title: "Receipt",
    description: "Order lines, a divider, and an emphasized total inside an EmailPanel.",
    source: exampleFile("Receipt email", "receipt"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailReceiptPreview })),
    ),
    previewModule: harnessModule,
  },
];

export const emailEntry = {
  id: "email",
  kind: "Agent",
  name: "Email",
  status: "experimental",
  summary:
    "React Email compositions with Control UI colors and typography, brand header, image layouts, and a footer with social, address, and unsubscribe parts.",
  registryKind: "email",
  paths: {
    example: exampleFile("Invitation email", "invitation"),
    previewModule: harnessModule,
    usage: {
      mastra: sourceFile("Server rendering", "src/registry/usage/components/email.tsx", "usage"),
      "ai-sdk": sourceFile("Server rendering", "src/registry/usage/components/email.tsx", "usage"),
    },
    source: sourceFile("Email components", "src/registry/sources/control-ui/email/email.tsx", "component"),
    supportFiles: [
      sourceFile("Theme adapter", "src/registry/sources/control-ui/email/theme.ts", "theme-adapter"),
      sourceFile("Eight email templates", "src/registry/sources/control-ui/email/templates.tsx", "templates"),
      sourceFile("Email guide", "src/registry/sources/control-ui/email/README.md", "guide"),
    ],
  },
  preview: preview(() =>
    import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailInvitationPreview })),
  ),
  additionalPreviews,
} as const;
