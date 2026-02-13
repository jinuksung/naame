import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "./seoConfig";

interface BuildSeoMetadataParams {
  title: string;
  description: string;
  pathname: string;
  noIndex?: boolean;
}

export function buildSeoMetadata({
  title,
  description,
  pathname,
  noIndex = false,
}: BuildSeoMetadataParams): Metadata {
  const canonicalUrl = absoluteUrl(pathname);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: !noIndex,
      follow: true,
    },
  };
}
