import { prisma } from "@/lib/db";
import { IncomingReportsList } from "@/components/officer/incoming-reports-list";
import { ShieldCheck, MapPin } from "lucide-react";

export default async function IncomingReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      user: { select: { name: true, phone: true } },
      statusLogs: {
        orderBy: { updatedAt: "asc" },
        include: { officer: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-0.5 text-xs font-bold text-emerald-800 mb-2 border border-emerald-200">
          <MapPin className="h-3.5 w-3.5" /> Modul Spasial Penugasan Petugas Lapangan
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Laporan Masuk &amp; Penugasan Spasial
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Sistem triase cerdas berbasis algoritma <strong>K-Nearest Neighbors (KNN)</strong> dan <strong>QuadTree</strong> untuk mengurutkan laporan terdekat dari Pos Bojong Kulur serta memprioritaskan penanganan di lapangan.
        </p>
      </div>

      <IncomingReportsList initialReports={reports} />
    </div>
  );
}
