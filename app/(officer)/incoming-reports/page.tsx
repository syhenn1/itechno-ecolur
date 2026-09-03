import { prisma } from "@/lib/db";
import { IncomingReportsList } from "@/components/officer/incoming-reports-list";
import { MapPin } from "lucide-react";

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
    take: 150,
  });

  const reportedCount = reports.filter((r) => r.status === "REPORTED").length;
  const inProgressCount = reports.filter((r) => r.status === "IN_PROGRESS" || r.status === "VERIFIED").length;
  const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="animate-fade-in-up flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 mb-2 border border-emerald-200">
            <MapPin className="h-3.5 w-3.5" /> Pusat Komando &amp; Triase Spasial Petugas Lapangan
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Terminal Penugasan &amp; Laporan Masuk
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Algoritma <strong>K-Nearest Neighbors (KNN)</strong> &amp; <strong>Priority Queue (Max-Heap)</strong> untuk optimasi rute dan kecepatan penanganan masalah warga Bojong Kulur.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-white border border-emerald-200 px-3.5 py-2 rounded-2xl shadow-2xs shrink-0">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pos Siaga: Kantor Desa Bojong Kulur</span>
        </div>
      </div>

      <IncomingReportsList
        initialReports={reports}
        stats={{
          total: reports.length,
          reported: reportedCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
        }}
      />
    </div>
  );
}
