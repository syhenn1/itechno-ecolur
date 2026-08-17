import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusTimeline } from "@/components/reports/status-timeline";
import { StatusUpdateForm } from "@/components/reports/status-update-form";

const STATUS_PRIORITY: Record<string, number> = { REPORTED: 0, VERIFIED: 1, IN_PROGRESS: 2, RESOLVED: 3 };

export default async function IncomingReportsPage() {
  const reports = await prisma.report.findMany({
    include: { user: { select: { name: true, phone: true } }, statusLogs: { orderBy: { updatedAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Reports aren't scoped to an officer's area yet — the schema has no area field on Report
  // itself (Officer.area exists but nothing links a report to one). Every officer sees every
  // report for now; add an area field + filter here if per-area routing becomes a requirement.
  const sorted = [...reports].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Laporan Masuk</h1>
        <p className="text-sm text-slate-600">Verifikasi dan perbarui status laporan warga.</p>
      </div>

      {sorted.length === 0 ? (
        <Card className="text-center text-sm text-slate-500">Belum ada laporan masuk.</Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div>
                  <CardTitle className="capitalize">{report.category.replace(/_/g, " ")}</CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.user.name} &middot;{" "}
                    {new Date(report.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge status={report.status} />
              </CardHeader>
              <p className="mb-4 text-sm text-slate-700">{report.description}</p>
              <StatusTimeline logs={report.statusLogs} />
              <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
