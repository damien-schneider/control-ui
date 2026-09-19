import { markdownForPath } from "@/app/(features)/agent-markdown/page-markdown";
import { markdownRedirectForPath } from "@/app/(features)/agent-markdown/redirects";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = `/${path.join("/")}`;
  const markdown = markdownForPath(pathname);
  if (!markdown) {
    const redirectTarget = markdownRedirectForPath(pathname);
    if (redirectTarget) return new Response(null, { status: 308, headers: { location: redirectTarget, vary: "Accept" } });
    return new Response("Not found\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  return new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      vary: "Accept",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
