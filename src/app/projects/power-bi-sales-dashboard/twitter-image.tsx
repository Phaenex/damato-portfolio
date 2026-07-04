import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Power BI Sales Dashboard: star-schema case study by Nicholas D'Amato";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "Case study",
    title: "Power BI Sales Dashboard",
    tagline: "Three-page dashboard on a star schema with DAX measures",
  });
}
