import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ClickTracker } from "@/components/ClickTracker";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

// Editorial type system: a serif display face for the name + headings, a clean
// grotesque for body/UI, and a real mono for code and the data tables. Loading
// actual typefaces (not system-ui) is the fastest way off the generic AI look.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nicholas D'Amato | Junior Data Analyst",
  description:
    "Junior data analyst pivoting from IT support. Python, SQL, Power BI work. Finishing an AAS in AI Data Specialist at WCTC.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Nicholas D'Amato | Junior Data Analyst",
    description:
      "Junior Data Analyst. Python, SQL, Power BI. Open to part-time and internship roles.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "Nicholas D'Amato | Junior Data Analyst",
    description:
      "Junior Data Analyst. Python, SQL, Power BI. Open to part-time and internship roles.",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0a09",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nicholas D'Amato",
  url: SITE_URL,
  description:
    "Data analytics student at WCTC, pivoting from IT support. Python, SQL, Power BI.",
  email: "mailto:nickdamatoit@gmail.com",
  address: { "@type": "PostalAddress", addressLocality: "Pewaukee", addressRegion: "WI" },
  sameAs: [
    "https://github.com/Damatnic",
    "https://linkedin.com/in/nicholas-damato2",
  ],
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Waukesha County Technical College" },
    { "@type": "CollegeOrUniversity", name: "Milwaukee Area Technical College" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-100">
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-[var(--accent)] focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-stone-950 focus-visible:shadow-lg"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
        <ClickTracker />
        <Script id="ld-person" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(personJsonLd)}
        </Script>
      </body>
    </html>
  );
}
