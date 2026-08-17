import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusTimeline } from "@/components/reports/status-timeline";

export default async function MyReportsPage() {
  const session = await getSession();
  if (!session) return null;

  const reports = await prisma.report.findMany({
    where: { userId: session.userId },
    include: { statusLogs: { orderBy: { updatedAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Laporan Saya</h1>
        <p className="text-sm text-slate-600">Pantau status laporan yang sudah Anda kirim.</p>
      </div>

      {reports.length === 0 ? (
        <Card className="text-center text-sm text-slate-500">
          Belum ada laporan. Buat laporan pertama Anda di menu Lapor.
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div>
                  <CardTitle className="capitalize">{report.category.replace(/_/g, " ")}</CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
