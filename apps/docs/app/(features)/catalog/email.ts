import { type CatalogNamedPreview, preview, sourceFile } from "./shared";

const harnessModule = "src/registry/examples/control-ui/email/preview.tsx";

const exampleFile = (label: string, name: string) =>
  sourceFile(label, `src/registry/examples/control-ui/email/messages/${name}.tsx`, "example");

const additionalPreviews: CatalogNamedPreview[] = [
  {
    id: "announcement",
    title: "Announcement",
    description: "Centered marketing send: logo masthead, hero image, a three-column highlight row, and a centered footer.",
    source: exampleFile("Announcement email", "announcement"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailAnnouncementPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "release-notes",
    title: "Release notes",
    description: "Versioned changelog bullets plus an EmailMarkdown migration note and a themed EmailCodeBlock snippet.",
    source: exampleFile("Release notes email", "release"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailReleaseNotesPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "editorial",
    title: "Image and text",
    description: "Two-column EmailColumns layout with a percentage-width image beside the story.",
    source: exampleFile("Editorial email", "editorial"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailEditorialPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "newsletter",
    title: "Newsletter",
    description: "Centered masthead over left-aligned articles, with the social, address, and legal block outside the card.",
    source: exampleFile("Newsletter email", "newsletter"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailNewsletterPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "summary",
    title: "Summary",
    description: "Metric row centered inside a panel, above EmailDetailRow lines for a recurring digest.",
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
      "Centered transactional send: EmailOneTimeCode for the code, and a footer that identifies the sender without an unsubscribe link.",
    source: exampleFile("Verification email", "verification"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailVerificationPreview })),
    ),
    previewModule: harnessModule,
  },
  {
    id: "receipt",
    title: "Receipt",
    description: "Compact heading, an EmailInlineCode order number, and order lines with an emphasized total inside an EmailPanel.",
    source: exampleFile("Receipt email", "receipt"),
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/email/preview").then((mod) => ({ default: mod.EmailReceiptPreview })),
    ),
    previewModule: harnessModule,
  },
];

export const emailEntry = {
  id: "email",
  category: "content",
  kind: "Component",
  name: "Email",
  status: "beta",
  summary:
    "React Email compositions with Control UI colors and typography: contained or plain surfaces, column layouts, themed markdown and code, and a footer with social icons, address, and unsubscribe parts.",
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
      sourceFile("Brand header and footer", "src/registry/sources/control-ui/email/email-brand.tsx", "brand"),
      sourceFile("Footer parts", "src/registry/sources/control-ui/email/email-footer.tsx", "footer"),
      sourceFile("Markdown and code", "src/registry/sources/control-ui/email/email-code.tsx", "code"),
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
