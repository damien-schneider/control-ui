import { NextResponse } from "next/server";
import { searchRegistry } from "@/app/(features)/registry-api/registry-index";

// GET /api/registry/search?q=<query> → {type:"search",data:SearchItem[]}; empty q = full corpus; same match surface as ⌘K palette (registry-search.ts).
export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json({ type: "search", data: searchRegistry(query) });
}
