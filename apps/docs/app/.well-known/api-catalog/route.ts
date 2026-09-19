import { apiCatalogLinkset } from "@/app/(features)/agent-discovery/api-catalog";

// RFC 9727 requires the linkset media type, so this cannot use NextResponse.json.
export function GET() {
  return new Response(JSON.stringify(apiCatalogLinkset), { headers: { "Content-Type": "application/linkset+json" } });
}
