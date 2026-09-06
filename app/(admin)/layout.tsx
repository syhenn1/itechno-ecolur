import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";

const ADMIN_LINKS = [{ href: "/dashboard", label: "Dashboard" }];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar name={session.name} roleLabel="Admin" links={ADMIN_LINKS} />
      {/* pb-* clears the fixed mobile bottom nav -- scoped to just the content, not the whole
          page, otherwise it left a big empty gap below the footer that sits after it. */}
      <div className="pb-28 sm:pb-32 md:pb-8">
        <TutorialProvider role="ADMIN">{children}</TutorialProvider>
      </div>
      <AppFooter />
    </div>
  );
}
