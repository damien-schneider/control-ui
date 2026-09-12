import { controlUiLogoSvg } from "@/app/(features)/brand/logo";

export const size = { width: 512, height: 512 };
export const contentType = "image/svg+xml";

export default function Icon() {
  return new Response(controlUiLogoSvg, {
    headers: { "Content-Type": contentType },
  });
}
