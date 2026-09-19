import { NextResponse } from "next/server";
import { aiCatalogManifest } from "@/app/(features)/agent-discovery/ai-catalog";

export function GET() {
  return NextResponse.json(aiCatalogManifest, { headers: { "Access-Control-Allow-Origin": "*" } });
}
