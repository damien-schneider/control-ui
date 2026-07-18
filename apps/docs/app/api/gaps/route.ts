import { appendFileSync, mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

// Swizzle gap-feedback (Astryx `swizzle --gap`): CLI posts here after eject, capturing why item fell short.
// POC persistence: one JSON line/gap in .gaps/gaps.jsonl (gitignored).
// Route stays pure — CLI stamps `ts`, never call Date here.
const gapsDir = path.join(process.cwd(), ".gaps");
const gapsFile = path.join(gapsDir, "gaps.jsonl");

export async function POST(request: Request) {
  // request.json() types as Promise<any>; annotate binding to narrow without an assertion.
  const payload: { item?: unknown; reason?: unknown; ts?: unknown } | null = await request.json().catch(() => null);
  if (!payload || typeof payload.item !== "string" || typeof payload.reason !== "string") {
    return NextResponse.json({ error: "Expected { item, reason }", code: "ERR_INVALID_GAP" }, { status: 400 });
  }

  const entry = {
    item: payload.item,
    reason: payload.reason,
    ...(typeof payload.ts === "string" ? { ts: payload.ts } : {}),
  };
  mkdirSync(gapsDir, { recursive: true });
  appendFileSync(gapsFile, `${JSON.stringify(entry)}\n`);
  return NextResponse.json({ type: "gap", data: entry });
}

function isMissingFile(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

export async function GET() {
  let contents: string;
  try {
    contents = await readFile(gapsFile, "utf8");
  } catch (error) {
    if (isMissingFile(error)) return NextResponse.json({ type: "gaps", data: [] });
    throw error;
  }
  const gaps = contents
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  return NextResponse.json({ type: "gaps", data: gaps });
}
