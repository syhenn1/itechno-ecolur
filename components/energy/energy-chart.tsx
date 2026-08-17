"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface EnergyPoint {
  period: string;
  consumptionKwh: number;
}

// Single series (one citizen's own history) — reuses the app's brand accent rather than the
// categorical palette, since there's no adjacent series to distinguish it from.
const SERIES_COLOR = "#059669";

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <div className="font-medium text-slate-900">{label}</div>
      <div className="text-slate-600">{payload[0].value.toLocaleString("id-ID")} kWh</div>
    </div>
  );
}

export function EnergyChart({ data }: { data: EnergyPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-slate-500">
        Belum ada data untuk ditampilkan. Input konsumsi bulan ini untuk mulai melihat tren.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES_COLOR} stopOpacity={0.1} />
            <stop offset="100%" stopColor={SERIES_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="consumptionKwh"
          stroke={SERIES_COLOR}
          strokeWidth={2}
          strokeLinecap="round"
          fill="url(#energyFill)"
          dot={{ r: 4, fill: SERIES_COLOR, stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 5, fill: SERIES_COLOR, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
