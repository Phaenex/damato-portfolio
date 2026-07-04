import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Now | Nicholas D'Amato — what I'm working on";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "Now",
    title: "What I'm working on",
    tagline: "Dated log of courses, projects, and tools. Most recent first.",
  });
}
