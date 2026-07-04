import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Car Rental Database: SQL Server schema case study by Nicholas D'Amato";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    kicker: "Case study",
    title: "Car Rental Database",
    tagline: "SQL Server schema with year-based partitioning and audit triggers",
  });
}
