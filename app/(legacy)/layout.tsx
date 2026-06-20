import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../globals.css";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "WolneMoce - Portal wolnych mocy produkcyjnych",
    template: "%s | WolneMoce",
  },
  description:
    "WolneMoce to B2B marketplace dla firm szukających kooperantów, podwykonawców i wolnych mocy produkcyjnych.",
  openGraph: {
    title: "WolneMoce - Portal wolnych mocy produkcyjnych",
    description:
      "Znajdź podwykonawcę albo pokaż wolne moce produkcyjne swojej firmy.",
    url: getSiteUrl(),
    siteName: "WolneMoce",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/og/wolnemoce-og.png"),
        width: 1200,
        height: 630,
        alt: "WolneMoce - marketplace B2B wolnych mocy produkcyjnych",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WolneMoce - Portal wolnych mocy produkcyjnych",
    description:
      "Marketplace B2B dla firm szukających podwykonawców i wolnych mocy produkcyjnych.",
    images: [getAbsoluteUrl("/og/wolnemoce-og.png")],
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
