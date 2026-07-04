import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Olympic Medal Pipeline: interactive dashboard by Nicholas D'Amato";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "Interactive dashboard",
    title: "Olympic Medal Pipeline",
    tagline: "1,343 medal records from a Python ETL, filterable in the browser",
  });
}
