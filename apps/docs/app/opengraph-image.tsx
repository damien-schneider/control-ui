import { renderSocialImage } from "@/app/(features)/seo/metadata-image";
import { socialImageSize } from "@/app/(features)/seo/social-image-config";

export const alt = "Control UI — React components for AI interfaces";
export const size = socialImageSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderSocialImage();
}
