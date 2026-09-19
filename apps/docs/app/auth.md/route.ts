import { buildAuthMarkdown } from "@/app/(features)/agent-discovery/auth-md";

export function GET() {
  return new Response(buildAuthMarkdown(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
