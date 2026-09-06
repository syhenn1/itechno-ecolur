import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";

const OFFICER_LINKS = [{ href: "/incoming-reports", label: "Laporan Masuk" }];

export default async function OfficerLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "OFFICER") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar name={session.name} roleLabel="Petugas" links={OFFICER_LINKS} />
      <OnboardingTour role="OFFICER" />
      {/* pb-* clears the fixed mobile bottom nav — scoped to just the content, not the whole
          page, otherwise it left a big empty gap below the footer that sits after it. */}
      <div className="pb-28 sm:pb-32 md:pb-8">{children}</div>
      <AppFooter />
    </div>
  );
}
