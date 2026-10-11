import { renderSocialImage } from "@/app/(features)/seo/metadata-image";
import { socialImageSize } from "@/app/(features)/seo/social-image-config";
import { siteConfig } from "@/lib/site-config";

export const alt = siteConfig.title;
export const size = socialImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return renderSocialImage();
}
