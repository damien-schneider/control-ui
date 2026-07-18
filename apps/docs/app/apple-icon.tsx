import { renderIcon } from "@/app/(features)/seo/metadata-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderIcon(size.width);
}
