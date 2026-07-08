import type { Metadata } from "next";
import { Cormorant_Garamond, Onest, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Музей БелОГ",
  description: "Интерактивное ПО для тач-экранов музея Белорусского общества глухих",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${onest.variable} ${cormorant.variable} ${mono.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
