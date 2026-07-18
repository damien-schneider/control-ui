import { createThemeFaviconSvg, themeFaviconColors } from "@/app/(features)/theme/favicon";

export const size = { width: 512, height: 512 };
export const contentType = "image/svg+xml";

const colorScheme = `
:root {
  --icon-background: ${themeFaviconColors.light.background};
  --icon-brand: ${themeFaviconColors.light.brand};
}
@media (prefers-color-scheme: dark) {
  :root {
    --icon-background: ${themeFaviconColors.dark.background};
    --icon-brand: ${themeFaviconColors.dark.brand};
  }
}`;

export default function Icon() {
  return new Response(createThemeFaviconSvg("var(--icon-background)", "var(--icon-brand)", colorScheme), {
    headers: { "Content-Type": contentType },
  });
}
