import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsMapLoader } from "@/components/admin/reports-map-loader";
import { AiSummaryPanel } from "@/components/admin/ai-summary-panel";
import { ExportCsvButton } from "@/components/admin/export-csv-button";

const STATUS_ORDER = ["REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"] as const;

export default async function AdminDashboardPage() {
  const [reports, totalCitizens, avgConsumption] = await Promise.all([
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.user.count({ where: { role: "CITIZEN" } }),
    prisma.energyLog.aggregate({ _avg: { consumptionKwh: true } }),
  ]);

  const statusCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard Transparansi</h1>
        <p className="text-sm text-slate-600">Statistik agregat energi dan laporan warga.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-xs font-medium text-slate-500">Total Laporan</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{reports.length}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Selesai</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-600">{statusCounts.RESOLVED ?? 0}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Warga Terdaftar</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{totalCitizens}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Rata-rata Konsumsi</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {avgConsumption._avg.consumptionKwh ? `${avgConsumption._avg.consumptionKwh.toFixed(1)} kWh` : "-"}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Laporan</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="rounded-lg bg-slate-50 p-3 text-center">
              <div className="text-lg font-semibold text-slate-900">{statusCounts[status] ?? 0}</div>
              <div className="text-xs text-slate-500">{statusLabel(status)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Pola Masalah (AI)</CardTitle>
        </CardHeader>
        <AiSummaryPanel />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peta Sebaran Laporan</CardTitle>
        </CardHeader>
        <ReportsMapLoader
          reports={reports.map((r) => ({ id: r.id, category: r.category, status: r.status, lat: r.lat, lng: r.lng }))}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ekspor Data</CardTitle>
          <ExportCsvButton
            rows={reports.map((r) => ({
              id: r.id,
              category: r.category,
              status: r.status,
              description: r.description,
              createdAt: r.createdAt.toISOString(),
            }))}
          />
        </CardHeader>
      </Card>
    </div>
  );
}
