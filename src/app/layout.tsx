import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { siteConfig } from "@/site.config";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

const { business: b } = siteConfig;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: `${b.name} | Professional Cleaning Services in Bacolod City`, template: `%s | ${b.name}` },
  description: b.description,
  applicationName: b.name,
  openGraph: { type: "website", siteName: b.name, locale: "en_PH" },
  twitter: { card: "summary_large_image" },
  // Sample content must never be indexed.
  robots: siteConfig.contentReviewed ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0b7a75" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>
        <a className="skip-link" href="#main">Skip to main content</a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
