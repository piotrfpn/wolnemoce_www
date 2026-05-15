import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WolneMoce.pl - Portal Wolnych Mocy Produkcyjnych",
  description:
    "Marketplace B2B łączący firmy szukające podwykonawców z firmami posiadającymi wolne moce produkcyjne.",
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
