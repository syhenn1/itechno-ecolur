import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEnergyRecommendation } from "@/lib/ai";
import { formatRupiah } from "@/lib/utils";
import { levelForXp, getLevelDef, type LeaderboardUser } from "@/lib/gamification-data";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyForm } from "@/components/energy/energy-form";
import { EnergyChart } from "@/components/energy/energy-chart";
import { RecommendationCard } from "@/components/energy/recommendation-card";
import { Top3Podium } from "@/components/gamification/top3-podium";
import { Zap, Coins, CloudFog, TrendingUp, History } from "lucide-react";

export default async function EnergyPage() {
  const session = await getSession();
  if (!session) return null;

  const [logs, topUsers] = await Promise.all([
    prisma.energyLog.findMany({
      where: { userId: session.userId },
      orderBy: { period: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "CITIZEN" },
      orderBy: { xp: "desc" },
      take: 10,
      select: { id: true, name: true, rtRw: true, xp: true },
    }),
  ]);

  const recommendation = await getEnergyRecommendation(logs);
  const latest = logs.at(-1);

  const leaderboardUsers: LeaderboardUser[] = topUsers.map((u, idx) => {
    const lvl = levelForXp(u.xp);
    const def = getLevelDef(lvl);
    return {
      id: u.id,
      rank: idx + 1,
      name: u.name,
      rtRw: u.rtRw || "Desa Bojong Kulur",
      xp: u.xp,
      level: lvl,
      badgeName: def.badgeName,
      badgeIcon: def.badgeIcon,
      isCurrentUser: u.id === session.userId,
    };
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Konsumsi energi</h1>
        <p className="text-sm text-slate-600 mt-1">
          Catat konsumsi listrik bulanan untuk mendapatkan rekomendasi hemat energi dan XP.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Konsumsi terakhir</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {latest ? `${latest.consumptionKwh} ` : "-"}
            {latest && <span className="text-sm font-semibold text-slate-500">kWh</span>}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Periode: {latest?.period || "-"}</div>
        </div>

        <div className="rounded-md border border-slate-200 border-l-4 border-l-amber-500 bg-white p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimasi biaya</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500 text-white">
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
            {latest ? formatRupiah(latest.costEstimate) : "-"}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Tarif penyesuaian PLN R-1/TR</div>
        </div>

        <div className="rounded-md border border-slate-200 border-l-4 border-l-sky-500 bg-white p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimasi emisi CO2</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600 text-white">
              <CloudFog className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {latest ? `${latest.co2Estimate} ` : "-"}
            {latest && <span className="text-sm font-semibold text-slate-500">kg CO2</span>}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Faktor emisi 0,87 kg/kWh</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                  <Zap className="h-3.5 w-3.5" />
                </span>
                Input konsumsi listrik bulan ini (+30 XP)
              </CardTitle>
            </CardHeader>
            <EnergyForm />
          </Card>

          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                  <TrendingUp className="h-3.5 w-3.5" />
                </span>
                Grafik tren pemakaian listrik
              </CardTitle>
            </CardHeader>
            <EnergyChart data={logs.map((l) => ({ period: l.period, consumptionKwh: l.consumptionKwh }))} />
          </Card>

          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-600" />
                  Riwayat pencatatan
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Periode</th>
                      <th className="pb-3 font-semibold">Konsumsi</th>
                      <th className="pb-3 font-semibold">Biaya</th>
                      <th className="pb-3 font-semibold">CO2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...logs].reverse().slice(0, 5).map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2.5 font-semibold text-slate-900 text-xs">{log.period}</td>
                        <td className="py-2.5 font-semibold text-slate-700 font-mono text-xs">{log.consumptionKwh} kWh</td>
                        <td className="py-2.5 text-slate-700 text-xs">{formatRupiah(log.costEstimate)}</td>
                        <td className="py-2.5 text-slate-600 font-mono text-xs">{log.co2Estimate} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <RecommendationCard initialRecommendation={recommendation} />
          <Top3Podium users={leaderboardUsers} currentUserId={session.userId} />
        </div>
      </div>
    </div>
  );
}
