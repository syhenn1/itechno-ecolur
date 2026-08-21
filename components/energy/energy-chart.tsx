"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface EnergyPoint {
  period: string;
  consumptionKwh: number;
}

const SERIES_COLOR = "#507b00";
const ACCENT_COLOR = "#95c22b";

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white px-3.5 py-2.5 text-xs shadow-md">
      <div className="font-bold text-slate-900">{label}</div>
      <div className="text-emerald-800 font-extrabold mt-0.5 font-mono">
        {payload[0].value.toLocaleString("id-ID")} kWh
      </div>
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
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity={0.4} />
            <stop offset="50%" stopColor={SERIES_COLOR} stopOpacity={0.15} />
            <stop offset="100%" stopColor={SERIES_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="consumptionKwh"
          stroke={SERIES_COLOR}
          strokeWidth={3}
          strokeLinecap="round"
          fill="url(#energyFill)"
          dot={{ r: 4.5, fill: ACCENT_COLOR, stroke: "#28430a", strokeWidth: 2 }}
          activeDot={{ r: 6.5, fill: "#a7d930", stroke: "#28430a", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
