import { NextResponse } from "next/server";
import { openApiDocument } from "@/app/(features)/agent-discovery/openapi";

export function GET() {
  return NextResponse.json(openApiDocument);
}
