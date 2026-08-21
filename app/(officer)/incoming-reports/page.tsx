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
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold text-slate-900">Laporan Masuk &amp; Penugasan</h1>
        <p className="text-sm text-slate-600">
          Sistem triase cerdas (Priority Queue &amp; QuadTree KNN) untuk prioritas respon petugas.
        </p>
      </div>

      <IncomingReportsList initialReports={reports} />
    </div>
  );
}
