"use client";

import dynamic from "next/dynamic";

const ReportsMap = dynamic(() => import("@/components/admin/reports-map").then((m) => m.ReportsMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-500">
      Memuat peta...
    </div>
  ),
});

interface MapReport {
  id: string;
  category: string;
  status: string;
  lat: number;
  lng: number;
}

// Thin client-boundary wrapper — `ssr: false` in next/dynamic is only allowed inside a Client
// Component, so the admin dashboard (a Server Component) renders this instead of the map directly.
export function ReportsMapLoader({ reports }: { reports: MapReport[] }) {
  return <ReportsMap reports={reports} />;
}
