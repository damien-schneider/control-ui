import { type NextRequest, NextResponse } from "next/server";
import { prefersMarkdown } from "@/app/(features)/agent-markdown/accept";

export function proxy(request: NextRequest) {
  if (!prefersMarkdown(request.headers.get("accept"))) return NextResponse.next();
  const { pathname } = request.nextUrl;
  const markdownUrl = request.nextUrl.clone();
  markdownUrl.pathname = pathname === "/" ? "/api/markdown" : `/api/markdown${pathname}`;
  return NextResponse.rewrite(markdownUrl);
}

export const config = {
  matcher: ["/((?!_next/|api/|r/|og/|.*\\.).*)"],
};
