"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";

export interface RtRwPoint {
  rtRw: string;
  reportCount: number;
  citizenCount: number;
}

// A single series (jumlah laporan) ranked by magnitude across wilayah — one solid hue, not a
// per-bar value-ramp (that would double-encode the bar's own length as color, see the dataviz
// skill's anti-pattern list). Emerald matches the report module's accent color elsewhere in the
// admin UI (StatusBadge, report cards).
const BAR_COLOR = "#059669";

interface TooltipProps {
  active?: boolean;
  payload?: { payload: RtRwPoint }[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white px-3.5 py-2.5 text-xs shadow-md">
      <div className="font-bold text-slate-900">{point.rtRw}</div>
      <div className="mt-0.5 font-mono font-extrabold text-emerald-800">{point.reportCount} laporan</div>
      <div className="text-slate-500">{point.citizenCount} warga terdaftar</div>
    </div>
  );
}

/** Horizontal bar chart ranking wilayah (RT/RW) by report count — paired with a table (see the
 *  caller) so every value stays reachable without hovering. Height grows with the row count
 *  instead of being fixed, so the x-axis band is never squeezed out (see dataviz anti-patterns). */
export function RtRwDistributionChart({ data }: { data: RtRwPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        Belum ada data wilayah untuk ditampilkan.
      </div>
    );
  }

  const chartHeight = Math.max(180, data.length * 40 + 40);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 4, bottom: 4 }} barSize={20}>
        <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="rtRw"
          width={72}
          tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="reportCount" fill={BAR_COLOR} radius={[0, 4, 4, 0]}>
          <LabelList dataKey="reportCount" position="right" style={{ fill: "#334155", fontSize: 12, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
