import { z } from "zod";
import { skinMetas } from "@/app/(features)/catalog/skins";
import type { EmailVariant } from "@/components/control-ui/email/email";
import type { EmailTheme } from "@/components/control-ui/email/theme";

export const emailLayouts = [
  { id: "invitation", label: "Invitation" },
  { id: "product", label: "Announcement" },
  { id: "release", label: "Release notes" },
  { id: "editorial", label: "Image + text" },
  { id: "newsletter", label: "Newsletter" },
  { id: "summary", label: "Summary" },
  { id: "verification", label: "Verification" },
  { id: "receipt", label: "Receipt" },
] as const;

export const emailVariants = [
  { id: "contained", label: "Contained" },
  { id: "plain", label: "Plain" },
] as const;

export const emailPreviewRequest = z.object({
  layout: z.enum(emailLayouts.map((layout) => layout.id)),
  variant: z.enum(emailVariants.map((variant) => variant.id)),
  skin: z.enum(skinMetas.map((skin) => skin.id)),
  mode: z.enum(["light", "dark"]),
  tokens: z.record(z.string().regex(/^--[\w-]+$/), z.string().min(1).max(512)).refine((tokens) => Object.keys(tokens).length <= 512),
});

export const emailPreviewResult = z.object({ html: z.string(), text: z.string() });
export type EmailLayoutId = (typeof emailLayouts)[number]["id"];
export type EmailPreviewResult = z.infer<typeof emailPreviewResult>;
export type EmailExampleProps = { theme: EmailTheme; variant: EmailVariant };
