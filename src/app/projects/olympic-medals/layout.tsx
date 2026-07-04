import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { projects } from "@/lib/projects";
import { projectJsonLd } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Olympic Medal Pipeline | Nicholas D'Amato",
  description:
    "Interactive dashboard for the Olympic Medal Data Pipeline: 1,343 medal records from Tokyo 2020 and Beijing 2022, scraped, parsed, enriched, and filterable in the browser.",
  alternates: { canonical: "/projects/olympic-medals" },
  openGraph: {
    title: "Olympic Medal Pipeline | Nicholas D'Amato",
    description:
      "Interactive dashboard: 1,343 Olympic medal records, scraped and enriched by a Python ETL, filterable in the browser.",
    type: "article",
    url: "/projects/olympic-medals",
    images: ["/projects/olympic-medals/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olympic Medal Pipeline | Nicholas D'Amato",
    description:
      "Interactive dashboard: 1,343 Olympic medal records, scraped and enriched by a Python ETL, filterable in the browser.",
    images: ["/projects/olympic-medals/opengraph-image"],
  },
};

const project = projects.find((p) => p.slug === "olympic-medal-etl")!;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={projectJsonLd(project)} />
      {children}
    </>
  );
}
