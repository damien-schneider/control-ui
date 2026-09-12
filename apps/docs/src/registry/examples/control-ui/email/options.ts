import { z } from "zod";
import { skinMetas } from "@/app/(features)/catalog/skins";

export const emailLayouts = [
  { id: "invitation", label: "Invitation" },
  { id: "product", label: "Announcement" },
  { id: "editorial", label: "Image + text" },
  { id: "newsletter", label: "Newsletter" },
  { id: "summary", label: "Summary" },
] as const;

export const emailPreviewRequest = z.object({
  layout: z.enum(emailLayouts.map((layout) => layout.id)),
  skin: z.enum(skinMetas.map((skin) => skin.id)),
  mode: z.enum(["light", "dark"]),
  tokens: z.record(z.string().regex(/^--[\w-]+$/), z.string().min(1).max(512)).refine((tokens) => Object.keys(tokens).length <= 512),
});

export const emailPreviewResult = z.object({ html: z.string(), text: z.string() });
export type EmailLayoutId = (typeof emailLayouts)[number]["id"];
export type EmailPreviewResult = z.infer<typeof emailPreviewResult>;
