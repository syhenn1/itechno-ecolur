import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";

const OFFICER_LINKS = [{ href: "/incoming-reports", label: "Laporan Masuk" }];

export default async function OfficerLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "OFFICER") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 pb-28 sm:pb-32 md:pb-8">
      <Navbar name={session.name} roleLabel="Petugas" links={OFFICER_LINKS} />
      {children}
    </div>
  );
}
