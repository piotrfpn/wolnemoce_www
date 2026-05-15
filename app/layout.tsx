import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wolnemoce.pl"),
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
    url: "https://wolnemoce.pl",
    siteName: "WolneMoce.pl",
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "WolneMoce.pl - Portal wolnych mocy produkcyjnych",
    description:
      "Marketplace B2B dla firm szukających podwykonawców i wolnych mocy produkcyjnych.",
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
