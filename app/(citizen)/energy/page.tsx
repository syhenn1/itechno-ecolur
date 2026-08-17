import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEnergyRecommendation } from "@/lib/ai";
import { formatRupiah } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyForm } from "@/components/energy/energy-form";
import { EnergyChart } from "@/components/energy/energy-chart";
import { RecommendationCard } from "@/components/energy/recommendation-card";

export default async function EnergyPage() {
  const session = await getSession();
  if (!session) return null; // middleware + layout already guard this route

  const logs = await prisma.energyLog.findMany({
    where: { userId: session.userId },
    orderBy: { period: "asc" },
  });

  const recommendation = await getEnergyRecommendation(logs);
  const latest = logs.at(-1);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Konsumsi Energi</h1>
        <p className="text-sm text-slate-600">Catat konsumsi listrik bulanan dan pantau trennya di sini.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Konsumsi Bulan Ini</CardTitle>
        </CardHeader>
        <EnergyForm />
      </Card>

      <RecommendationCard initialRecommendation={recommendation} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-xs font-medium text-slate-500">Konsumsi Terakhir</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {latest ? `${latest.consumptionKwh} kWh` : "-"}
          </div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Estimasi Biaya</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {latest ? formatRupiah(latest.costEstimate) : "-"}
          </div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-slate-500">Estimasi CO2</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{latest ? `${latest.co2Estimate} kg` : "-"}</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tren Konsumsi</CardTitle>
        </CardHeader>
        <EnergyChart data={logs.map((l) => ({ period: l.period, consumptionKwh: l.consumptionKwh }))} />
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Lengkap</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-medium">Periode</th>
                  <th className="pb-2 font-medium">Konsumsi</th>
                  <th className="pb-2 font-medium">Biaya</th>
                  <th className="pb-2 font-medium">CO2</th>
                </tr>
              </thead>
              <tbody>
                {[...logs].reverse().map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-slate-900">{log.period}</td>
                    <td className="py-2 text-slate-600">{log.consumptionKwh} kWh</td>
                    <td className="py-2 text-slate-600">{formatRupiah(log.costEstimate)}</td>
                    <td className="py-2 text-slate-600">{log.co2Estimate} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
