import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";

const ADMIN_LINKS = [{ href: "/dashboard", label: "Dashboard" }];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 pb-28 sm:pb-32 md:pb-8">
      <Navbar name={session.name} roleLabel="Admin" links={ADMIN_LINKS} />
      <OnboardingTour role="ADMIN" />
      {children}
      <AppFooter />
    </div>
  );
}
