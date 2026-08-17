import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";

const CITIZEN_LINKS = [
  { href: "/energy", label: "Energi" },
  { href: "/report", label: "Lapor" },
  { href: "/my-reports", label: "Laporan Saya" },
];

export default async function CitizenLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "CITIZEN") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar name={session.name} roleLabel="Warga" links={CITIZEN_LINKS} />
      {children}
    </div>
  );
}
