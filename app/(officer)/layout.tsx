import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";

const OFFICER_LINKS = [{ href: "/incoming-reports", label: "Laporan Masuk" }];

export default async function OfficerLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "OFFICER") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar name={session.name} roleLabel="Petugas" links={OFFICER_LINKS} />
      {/* No mobile bottom-nav clearance needed here: Navbar skips rendering that bar entirely
          for a single-link role like this one (see hasNavLinks in navbar.tsx). */}
      <div className="pb-8">
        <TutorialProvider role="OFFICER">{children}</TutorialProvider>
      </div>
      <AppFooter />
    </div>
  );
}
