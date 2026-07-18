import { NextResponse } from "next/server";
import { getRegistryItem, isRegistryError } from "@/app/(features)/registry-api/api";

// GET /api/registry/<id> → item w/ source+install+deps, or {error,code:"ERR_UNKNOWN_ITEM",suggestions} 404 on miss.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = getRegistryItem(id);
  if (isRegistryError(result)) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
