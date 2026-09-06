import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Baloo_2 } from "next/font/google";
import "./globals.css";
import { VersionBadge } from "@/components/layout/version-badge";
import { CenterToaster } from "@/lib/toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Rounded, friendly display face used only for popup titles (components/ui/popup-shell.tsx) --
// scoped to that one spot via the CSS variable rather than replacing the app's body font.
const baloo2 = Baloo_2({ variable: "--font-baloo", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "EcoLur",
  description: "Platform pemantauan energi dan pelaporan layanan publik untuk kota yang berkelanjutan.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} ${baloo2.variable} font-sans antialiased`}>
        {children}
        <VersionBadge />
        <CenterToaster />
      </body>
    </html>
  );
}
