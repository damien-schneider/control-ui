import { NextResponse } from "next/server";
import { buildMcpServerCard } from "@/app/(features)/agent-discovery/mcp-server-card";

export function GET() {
  return NextResponse.json(buildMcpServerCard(), {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
