import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  // Keep sample content out of search results until the client signs it off.
  if (!siteConfig.contentReviewed) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
