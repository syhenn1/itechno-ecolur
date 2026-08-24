import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEnergyRecommendation } from "@/lib/ai";
import { formatRupiah } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyForm } from "@/components/energy/energy-form";
import { EnergyChart } from "@/components/energy/energy-chart";
import { RecommendationCard } from "@/components/energy/recommendation-card";
import { SolarSimulator } from "@/components/energy/solar-simulator";
import { Top3Podium } from "@/components/gamification/top3-podium";
import { Zap, Coins, CloudFog, Sparkles, TrendingUp, History } from "lucide-react";

export default async function EnergyPage() {
  const session = await getSession();
  if (!session) return null;

  const logs = await prisma.energyLog.findMany({
    where: { userId: session.userId },
    orderBy: { period: "asc" },
  });

  const recommendation = await getEnergyRecommendation(logs);
  const latest = logs.at(-1);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 mb-2 border border-emerald-200">
          <Sparkles className="h-3.5 w-3.5" /> Modul Efisiensi Energi &middot; SDG 7
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Konsumsi Energi &amp; Jejak Karbon
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Catat konsumsi listrik bulanan rumah tangga untuk mendapatkan XP dan rekomendasi hemat energi berbasis AI.
        </p>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid animate-fade-in-up gap-4 sm:grid-cols-3" style={{ animationDelay: "60ms" }}>
        <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Konsumsi Terakhir</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {latest ? `${latest.consumptionKwh} ` : "-"}
            {latest && <span className="text-sm font-bold text-slate-500">kWh</span>}
          </div>
          <div className="mt-1 text-[11px] font-medium text-emerald-700">Periode: {latest?.period || "-"}</div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Biaya</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
            {latest ? formatRupiah(latest.costEstimate) : "-"}
          </div>
          <div className="mt-1 text-[11px] font-medium text-amber-700">Tarif penyesuaian PLN R-1/TR</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Emisi CO2</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#28430a]/10 text-[#28430a]">
              <CloudFog className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#28430a] font-mono">
            {latest ? `${latest.co2Estimate} ` : "-"}
            {latest && <span className="text-sm font-bold text-slate-500">kg CO2</span>}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Faktor emisi 0,85 kg/kWh</div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (7 cols): Input Form & Chart */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="animate-fade-in-up border-slate-200 bg-white shadow-xs rounded-3xl" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-600" />
                Input Konsumsi Listrik Bulan Ini (+30 XP)
              </CardTitle>
            </CardHeader>
            <EnergyForm />
          </Card>

          <Card className="animate-fade-in-up border-slate-200 bg-white shadow-xs rounded-3xl" style={{ animationDelay: "140ms" }}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Grafik Tren Pemakaian Listrik
              </CardTitle>
            </CardHeader>
            <EnergyChart data={logs.map((l) => ({ period: l.period, consumptionKwh: l.consumptionKwh }))} />
          </Card>

          {logs.length > 0 && (
            <Card className="animate-fade-in-up border-slate-200 bg-white shadow-xs rounded-3xl" style={{ animationDelay: "180ms" }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-600" />
                  Riwayat Pencatatan
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 font-bold">Periode</th>
                      <th className="pb-3 font-bold">Konsumsi</th>
                      <th className="pb-3 font-bold">Biaya</th>
                      <th className="pb-3 font-bold">CO2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...logs].reverse().slice(0, 5).map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-emerald-50/40">
                        <td className="py-2.5 font-semibold text-slate-900 text-xs">{log.period}</td>
                        <td className="py-2.5 font-bold text-emerald-800 font-mono text-xs">{log.consumptionKwh} kWh</td>
                        <td className="py-2.5 text-slate-700 font-medium text-xs">{formatRupiah(log.costEstimate)}</td>
                        <td className="py-2.5 text-slate-600 font-mono text-xs">{log.co2Estimate} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (5 cols): AI Recommendation & Top 3 Podium Box Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <RecommendationCard initialRecommendation={recommendation} />
          </div>

          {/* Compact Top 3 Champions Box Card with 3D Badges */}
          <div className="animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            <Top3Podium currentUserId={session.userId} />
          </div>
        </div>
      </div>

      {/* Row 3: Solar Simulator (Full Width) */}
      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <SolarSimulator />
      </div>
    </div>
  );
}
