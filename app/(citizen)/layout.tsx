import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/layout/navbar";

import { levelForXp } from "@/lib/gamification-data";

const CITIZEN_LINKS = [
  { href: "/energy", label: "Energi" },
  { href: "/report", label: "Lapor" },
  { href: "/my-reports", label: "Laporan Saya" },
  { href: "/badges", label: "Lencana" },
  { href: "/ask-ai", label: "Tanya AI" },
];

export default async function CitizenLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "CITIZEN") redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { xp: true, level: true } });
  const currentLevel = user ? levelForXp(user.xp) : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar name={session.name} roleLabel="Warga" links={CITIZEN_LINKS} level={currentLevel} />
      {children}
    </div>
  );
}
