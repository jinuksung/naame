import { NextResponse } from "next/server";
import { absoluteUrl } from "@/seo/seoConfig";

export async function GET(): Promise<NextResponse> {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
