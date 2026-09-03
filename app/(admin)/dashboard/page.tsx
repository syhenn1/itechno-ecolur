import { Gift, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/utils";
import { LEVELS } from "@/lib/gamification-data";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { GovernmentBadge } from "@/components/layout/government-badge";
import { ReportsMapLoader } from "@/components/admin/reports-map-loader";
import { AiSummaryPanel } from "@/components/admin/ai-summary-panel";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { PrizeClaimRow } from "@/components/admin/prize-claim-row";

const STATUS_ORDER = ["REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"] as const;

export default async function AdminDashboardPage() {
  const [reports, totalCitizens, avgConsumption, pendingClaims] = await Promise.all([
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.user.count({ where: { role: "CITIZEN" } }),
    prisma.energyLog.aggregate({ _avg: { consumptionKwh: true } }),
    prisma.prizeClaim.findMany({
      where: { claimedAt: null },
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { level: "asc" },
    }),
  ]);

  const statusCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const avgKwh = avgConsumption._avg.consumptionKwh;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="animate-fade-in-up">
        <GovernmentBadge className="mb-2" />
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 mb-2 border border-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" /> Dashboard Transparansi &middot; SDG 11
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard Transparansi Publik
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Statistik agregat energi dan laporan warga Desa Bojong Kulur, real-time dari basis data.
        </p>
      </div>

      <div className="grid animate-fade-in-up gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "60ms" }}>
        <Card>
          <div className="text-xs font-medium text-slate-500">Total Laporan</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            <CountUp value={reports.length} />
          </div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Selesai</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-600">
            <CountUp value={statusCounts.RESOLVED ?? 0} />
          </div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Warga Terdaftar</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            <CountUp value={totalCitizens} />
          </div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Rata-rata Konsumsi</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {avgKwh ? <CountUp value={avgKwh} decimals={1} suffix=" kWh" /> : "-"}
          </div>
        </Card>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <CardTitle>Status Laporan</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="rounded-lg bg-slate-50 p-3 text-center transition-colors hover:bg-slate-100">
              <div className="text-lg font-semibold text-slate-900">
                <CountUp value={statusCounts[status] ?? 0} />
              </div>
              <div className="text-xs text-slate-500">{statusLabel(status)}</div>
            </div>
          ))}
        </div>
      </Card>

      {pendingClaims.length > 0 && (
        <Card className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-amber-500" aria-hidden="true" />
              Klaim Hadiah Menunggu ({pendingClaims.length})
            </CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {pendingClaims.map((claim) => (
              <PrizeClaimRow
                key={claim.id}
                claimId={claim.id}
                userName={claim.user.name}
                userPhone={claim.user.phone}
                level={claim.level}
                prize={LEVELS.find((l) => l.level === claim.level)?.prize ?? "-"}
              />
            ))}
          </ul>
        </Card>
      )}

      <Card className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        <CardHeader>
          <CardTitle>Ringkasan Pola Masalah (AI)</CardTitle>
        </CardHeader>
        <AiSummaryPanel />
      </Card>

      <Card className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
        <CardHeader>
          <CardTitle>Peta Sebaran Laporan</CardTitle>
        </CardHeader>
        <ReportsMapLoader
          reports={reports.map((r) => ({ id: r.id, category: r.category, status: r.status, lat: r.lat, lng: r.lng }))}
        />
      </Card>

      <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
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
