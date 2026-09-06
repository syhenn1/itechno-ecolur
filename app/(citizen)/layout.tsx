import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/layout/navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { levelForXp } from "@/lib/gamification-data";

const CITIZEN_LINKS = [
  { href: "/energy", label: "Energi" },
  { href: "/report", label: "Lapor & Riwayat" },
  { href: "/badges", label: "Hadiah & Lencana" },
  { href: "/ask-ai", label: "Tanya AI" },
];

export default async function CitizenLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "CITIZEN") redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { xp: true, level: true } });
  const currentLevel = user ? levelForXp(user.xp) : 1;

  return (
    <div className="min-h-screen bg-slate-100/70">
      <Navbar name={session.name} roleLabel="Warga" links={CITIZEN_LINKS} level={currentLevel} />
      {/* pb-* clears the fixed mobile bottom nav — scoped to just the content, not the whole
          page, otherwise it left a big empty gap below the footer that sits after it. */}
      <div className="pb-28 sm:pb-32 md:pb-8">
        <TutorialProvider>{children}</TutorialProvider>
      </div>
      <AppFooter />
    </div>
  );
}
