import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// No-op middleware to ensure Next.js always emits middleware manifest files in dev.
export function middleware(_request: NextRequest): NextResponse {
  return NextResponse.next();
}

