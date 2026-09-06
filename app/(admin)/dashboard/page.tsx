import { Gift, ClipboardList, CheckCircle2, Users, Zap, Sparkles, Map as MapIcon, Download } from "lucide-react";
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

const STATUS_TILE_CLASSES: Record<(typeof STATUS_ORDER)[number], string> = {
  REPORTED: "bg-slate-100 text-slate-900",
  VERIFIED: "bg-sky-50 text-sky-900",
  IN_PROGRESS: "bg-amber-50 text-amber-900",
  RESOLVED: "bg-emerald-50 text-emerald-900",
};

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
      <div>
        <GovernmentBadge className="mb-2" />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard transparansi</h1>
        <p className="text-sm text-slate-600 mt-1">Statistik agregat energi dan laporan warga Desa Jatikulur.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-sky-500 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total laporan</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600 text-white">
              <ClipboardList className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            <CountUp value={reports.length} />
          </div>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Selesai</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-700">
            <CountUp value={statusCounts.RESOLVED ?? 0} />
          </div>
        </Card>
        <Card className="border-l-4 border-l-violet-500 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Warga terdaftar</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 text-white">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            <CountUp value={totalCitizens} />
          </div>
        </Card>
        <Card className="border-l-4 border-l-amber-500 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rata-rata konsumsi</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500 text-white">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {avgKwh ? <CountUp value={avgKwh} decimals={1} suffix=" kWh" /> : "-"}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-700 text-white">
              <ClipboardList className="h-3.5 w-3.5" />
            </span>
            Status laporan
          </CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_ORDER.map((status) => (
            <div key={status} className={`rounded-md p-3 text-center ${STATUS_TILE_CLASSES[status]}`}>
              <div className="text-lg font-semibold">
                <CountUp value={statusCounts[status] ?? 0} />
              </div>
              <div className="text-xs opacity-80">{statusLabel(status)}</div>
            </div>
          ))}
        </div>
      </Card>

      {pendingClaims.length > 0 && (
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-white">
                <Gift className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Klaim hadiah menunggu ({pendingClaims.length})
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            Ringkasan pola masalah (AI)
          </CardTitle>
        </CardHeader>
        <AiSummaryPanel />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-600 text-white">
              <MapIcon className="h-3.5 w-3.5" />
            </span>
            Peta sebaran laporan
          </CardTitle>
        </CardHeader>
        <ReportsMapLoader
          reports={reports.map((r) => ({ id: r.id, category: r.category, status: r.status, lat: r.lat, lng: r.lng }))}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white">
              <Download className="h-3.5 w-3.5" />
            </span>
            Ekspor data
          </CardTitle>
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
