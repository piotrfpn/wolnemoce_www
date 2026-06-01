import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "WolneMoce.pl - Portal wolnych mocy produkcyjnych",
    template: "%s | WolneMoce.pl",
  },
  description:
    "Marketplace B2B łączący firmy szukające podwykonawców z firmami posiadającymi wolne moce produkcyjne, magazynowe, logistyczne i techniczne.",
  openGraph: {
    title: "WolneMoce.pl - Portal wolnych mocy produkcyjnych",
    description:
      "Znajdź podwykonawcę albo pokaż wolne moce produkcyjne swojej firmy.",
    url: getSiteUrl(),
    siteName: "WolneMoce.pl",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/images/offers/automation.jpg"),
        width: 1200,
        height: 630,
        alt: "WolneMoce.pl - marketplace B2B wolnych mocy produkcyjnych",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WolneMoce.pl - Portal wolnych mocy produkcyjnych",
    description:
      "Marketplace B2B dla firm szukających podwykonawców i wolnych mocy produkcyjnych.",
    images: [getAbsoluteUrl("/images/offers/automation.jpg")],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
