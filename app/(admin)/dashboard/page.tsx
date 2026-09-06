import { Gift, ClipboardList, CheckCircle2, Users, Zap, Sparkles, Map as MapIcon, Download, MapPinned, PieChart as PieChartIcon, Leaf } from "lucide-react";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/utils";
import { LEVELS } from "@/lib/gamification-data";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { GovernmentBadge } from "@/components/layout/government-badge";
import { ReportsMapLoader } from "@/components/admin/reports-map-loader";
import { AiSummaryPanel } from "@/components/admin/ai-summary-panel";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { PrizeClaimsList } from "@/components/admin/prize-claims-list";
import { RtRwDistributionChart } from "@/components/admin/rtrw-distribution";
import { CategoryDistributionChart } from "@/components/admin/category-distribution";
import { CarbonEmissionsPanel } from "@/components/admin/carbon-emissions-panel";

const STATUS_ORDER = ["REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"] as const;

const STATUS_TILE_CLASSES: Record<(typeof STATUS_ORDER)[number], string> = {
  REPORTED: "bg-slate-100 text-slate-900",
  VERIFIED: "bg-sky-50 text-sky-900",
  IN_PROGRESS: "bg-amber-50 text-amber-900",
  RESOLVED: "bg-emerald-50 text-emerald-900",
};

// Fixed order and labels for report categories -- every category always maps to the same pie
// slot regardless of its count that day (see the dataviz skill's "color follows the entity, not
// its rank" rule). Mirrors the same list used in the citizen report form and the AI summary panel.
const CATEGORY_META = [
  { value: "jalan_rusak", label: "Jalan Rusak" },
  { value: "sampah", label: "Sampah" },
  { value: "drainase", label: "Drainase" },
  { value: "penerangan_jalan", label: "Penerangan Jalan" },
  { value: "fasilitas_umum", label: "Fasilitas Umum" },
] as const;
const KNOWN_CATEGORY_VALUES = new Set<string>(CATEGORY_META.map((c) => c.value));

const UNKNOWN_RTRW_LABEL = "Belum diketahui";

export default async function AdminDashboardPage() {
  const [reports, totalCitizens, avgConsumption, pendingClaims, citizensByRtRwRaw, co2Total, co2ByPeriodRaw] =
    await Promise.all([
      prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { user: { select: { rtRw: true } } },
      }),
      prisma.user.count({ where: { role: "CITIZEN" } }),
      prisma.energyLog.aggregate({ _avg: { consumptionKwh: true } }),
      prisma.prizeClaim.findMany({
        where: { claimedAt: null },
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { level: "asc" },
      }),
      prisma.user.groupBy({
        by: ["rtRw"],
        where: { role: "CITIZEN" },
        _count: { _all: true },
      }),
      prisma.energyLog.aggregate({ _sum: { co2Estimate: true } }),
      prisma.energyLog.groupBy({
        by: ["period"],
        _sum: { co2Estimate: true },
        orderBy: { period: "asc" },
      }),
    ]);

  const statusCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const avgKwh = avgConsumption._avg.consumptionKwh;

  // Distribusi wilayah (RT/RW): jumlah laporan + jumlah warga terdaftar per wilayah. Seeded from
  // BOTH sources so a wilayah with citizens but zero reports (or vice versa) still shows a row
  // instead of silently disappearing.
  const reportCountByRtRw = new Map<string, number>();
  for (const r of reports) {
    const rtRw = r.user.rtRw ?? UNKNOWN_RTRW_LABEL;
    reportCountByRtRw.set(rtRw, (reportCountByRtRw.get(rtRw) ?? 0) + 1);
  }
  const citizenCountByRtRw = new Map(
    citizensByRtRwRaw.map((g) => [g.rtRw ?? UNKNOWN_RTRW_LABEL, g._count._all]),
  );
  const allRtRw = new Set([...reportCountByRtRw.keys(), ...citizenCountByRtRw.keys()]);
  const rtRwDistribution = Array.from(allRtRw)
    .map((rtRw) => ({
      rtRw,
      reportCount: reportCountByRtRw.get(rtRw) ?? 0,
      citizenCount: citizenCountByRtRw.get(rtRw) ?? 0,
    }))
    .sort((a, b) => b.reportCount - a.reportCount || b.citizenCount - a.citizenCount);

  // Distribusi kategori laporan -- unknown/free-form category values (Report.category is a plain
  // string, not a DB enum) fold into "Lainnya" rather than silently being dropped or blowing past
  // the pie chart's segment cap.
  const categoryCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1;
    return acc;
  }, {});
  const otherCategoryCount = reports.filter((r) => !KNOWN_CATEGORY_VALUES.has(r.category)).length;
  const categoryDistribution = [
    ...CATEGORY_META.map((c) => ({ category: c.value, label: c.label, count: categoryCounts[c.value] ?? 0 })),
    ...(otherCategoryCount > 0 ? [{ category: "lainnya", label: "Lainnya", count: otherCategoryCount }] : []),
  ];

  // Emisi karbon: co2Estimate sudah dihitung per log energi (lib/energy-calc.ts) saat warga
  // input konsumsi -- di sini cuma dijumlah/dikelompokkan per bulan, bukan dihitung ulang.
  const co2TotalKg = co2Total._sum.co2Estimate ?? 0;
  const co2Monthly = co2ByPeriodRaw
    .map((g) => ({ period: g.period, totalCo2Kg: g._sum.co2Estimate ?? 0 }))
    .slice(-12);

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white">
              <Leaf className="h-3.5 w-3.5" />
            </span>
            Emisi karbon
          </CardTitle>
        </CardHeader>
        <CarbonEmissionsPanel totalCo2Kg={co2TotalKg} monthly={co2Monthly} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                <MapPinned className="h-3.5 w-3.5" />
              </span>
              Distribusi laporan per wilayah (RT/RW)
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <RtRwDistributionChart data={rtRwDistribution} />
            {/* max-h + overflow-y-auto: Jatikulur has dozens of distinct RT/RW combinations, not
                a tidy handful -- without a cap this table alone pushed the whole dashboard page
                several screens tall. Header stays sticky so it's still readable mid-scroll. */}
            <div className="max-h-72 overflow-y-auto overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Wilayah</th>
                    <th className="px-3 py-2 font-semibold text-right">Laporan</th>
                    <th className="px-3 py-2 font-semibold text-right">Warga Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rtRwDistribution.map((row) => (
                    <tr key={row.rtRw}>
                      <td className="px-3 py-2 font-semibold text-slate-800">{row.rtRw}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-700">{row.reportCount}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-500">{row.citizenCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white">
                <PieChartIcon className="h-3.5 w-3.5" />
              </span>
              Distribusi kategori laporan
            </CardTitle>
          </CardHeader>
          <CategoryDistributionChart data={categoryDistribution} />
        </Card>
      </div>

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
          <PrizeClaimsList
            claims={pendingClaims.map((claim) => ({
              id: claim.id,
              userName: claim.user.name,
              userPhone: claim.user.phone,
              level: claim.level,
              prize: LEVELS.find((l) => l.level === claim.level)?.prize ?? "-",
            }))}
          />
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
