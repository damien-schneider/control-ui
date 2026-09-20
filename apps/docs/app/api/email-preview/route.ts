import { readFile } from "node:fs/promises";
import { cacheLife } from "next/cache";
import { createEmailTheme, type EmailTheme } from "@/components/control-ui/email/theme";
import { tokenMaps } from "@/components/control-ui/scripts/contrast-eval.mjs";
import type { SkinId } from "@/components/theme-drawer/types";
import { emailPreviewRequest } from "@/src/registry/examples/control-ui/email/options";
import { renderEmailExample } from "@/src/registry/examples/control-ui/email/render-example";

async function readEmailThemeCss(skin: SkinId) {
  "use cache";
  cacheLife("max");
  const themePaths = ["src/registry/sources/control-ui/theme.css"];
  if (skin !== "none") themePaths.push(`src/registry/skin-packs/${skin}/theme.css`);
  return Promise.all(themePaths.map((themePath) => readFile(themePath, "utf8")));
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > 40_000)
    return Response.json({ error: "Email preview request is too large." }, { status: 413 });
  const body = await request.text();
  if (body.length > 40_000) return Response.json({ error: "Email preview request is too large." }, { status: 413 });
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: "Email preview needs a JSON request." }, { status: 400 });
  }
  const parsed = emailPreviewRequest.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "Choose a supported layout and valid theme tokens." }, { status: 400 });
  const themeCss = await readEmailThemeCss(parsed.data.skin);
  const tokens = tokenMaps(themeCss)[parsed.data.mode];
  for (const [name, value] of Object.entries(parsed.data.tokens)) tokens.set(name, value);
  let theme: EmailTheme;
  try {
    theme = createEmailTheme(tokens, { colorScheme: parsed.data.mode });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not resolve the email theme." }, { status: 422 });
  }
  return Response.json(await renderEmailExample(parsed.data.layout, theme));
}
