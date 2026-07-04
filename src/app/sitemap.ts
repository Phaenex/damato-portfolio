import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const projectEntries = projects
    .filter((p): p is typeof p & { demoUrl: string } => Boolean(p.demoUrl))
    .map((p) => ({
      url: `${SITE_URL}${p.demoUrl}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.slug === "olympic-medal-etl" ? 0.8 : 0.7,
    }));

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/now`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...projectEntries,
  ];
}
