import { NextResponse } from "next/server";
import {
  GENDER_PARAMS,
  SEO_STATIC_PATHS,
  TOP_SURNAMES,
  absoluteUrl,
} from "@/seo/seoConfig";

function toUrlNode(pathname: string, lastModified: string): string {
  return `<url><loc>${absoluteUrl(pathname)}</loc><lastmod>${lastModified}</lastmod></url>`;
}

export async function GET(): Promise<NextResponse> {
  const lastModified = new Date().toISOString();

  const staticNodes = SEO_STATIC_PATHS.map((pathname) =>
    toUrlNode(pathname, lastModified),
  );
  const surnameNodes = TOP_SURNAMES.map((surname) =>
    toUrlNode(`/surname/${encodeURIComponent(surname)}`, lastModified),
  );
  const genderNodes = GENDER_PARAMS.map((gender) =>
    toUrlNode(`/gender/${gender}`, lastModified),
  );
  const comboNodes = TOP_SURNAMES.flatMap((surname) =>
    GENDER_PARAMS.map((gender) =>
      toUrlNode(`/combo/${encodeURIComponent(surname)}/${gender}`, lastModified),
    ),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticNodes, ...surnameNodes, ...genderNodes, ...comboNodes].join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
