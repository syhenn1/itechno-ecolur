import { prisma } from "@/lib/db";
import { IncomingReportsList } from "@/components/officer/incoming-reports-list";

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Laporan masuk</h1>
        <p className="text-sm text-slate-600 mt-1">
          Verifikasi laporan warga dan perbarui statusnya. Laporan diurutkan berdasarkan jarak dan tingkat prioritas.
        </p>
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
