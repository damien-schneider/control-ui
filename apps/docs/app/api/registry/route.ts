import { cacheLife } from "next/cache";
import { NextResponse } from "next/server";
import { listRegistry } from "@/app/(features)/registry-api/registry-index";

// GET /api/registry → aggregate index of all installable/readable items, {type:"index",data}; prerendered at build, doubles as machine catalog.
export async function GET() {
  return NextResponse.json(await getRegistryIndex());
}

async function getRegistryIndex() {
  "use cache";
  cacheLife("max");
  return listRegistry();
}
