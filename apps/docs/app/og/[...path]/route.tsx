import { renderSocialImage } from "@/app/(features)/seo/metadata-image";
import { docsSeoForPath } from "@/app/(features)/seo/seo";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { path } = await params;
  const seo = docsSeoForPath(`/${path.join("/")}`);
  if (!seo) return new Response("Not found", { status: 404 });

  const response = renderSocialImage({
    title: seo.socialImage.title,
    description: seo.description,
    label: seo.socialImage.label,
    pathname: seo.pathname,
    status: seo.socialImage.status,
  });
  response.headers.set("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800");
  return response;
}
