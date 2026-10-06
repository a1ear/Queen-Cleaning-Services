import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

const PAGES = [
  { path: "", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/request-a-quote", priority: 0.9 },
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.8 },
  { path: "/privacy", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority }) => ({
    url: `${siteConfig.siteUrl}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
