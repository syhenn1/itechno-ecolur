import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VersionBadge } from "@/components/layout/version-badge";
import { CenterToaster } from "@/lib/toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoLur",
  description: "Platform pemantauan energi dan pelaporan layanan publik untuk kota yang berkelanjutan.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <VersionBadge />
        <CenterToaster />
      </body>
    </html>
  );
}
