"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface CarbonMonthPoint {
  period: string;
  totalCo2Kg: number;
}

// Same hue pair as the citizen-facing energy trend chart (components/energy/energy-chart.tsx) —
// carbon emissions are derived directly from that same energy data, so keeping the visual
// language identical reads as "the same measurement, aggregated" rather than a new one.
const SERIES_COLOR = "#507b00";
const ACCENT_COLOR = "#95c22b";

function formatCo2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} ton CO2`;
  return `${kg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg CO2`;
}

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
      <div className="mt-0.5 font-mono font-extrabold text-emerald-800">{formatCo2(payload[0].value)}</div>
    </div>
  );
}

/** Stat figure (total emissions across every EnergyLog on record) + a monthly trend, mirroring
 *  EnergyChart's shape since this is that same co2Estimate field, just summed across all
 *  citizens instead of one. */
export function CarbonEmissionsPanel({
  totalCo2Kg,
  monthly,
}: {
  totalCo2Kg: number;
  monthly: CarbonMonthPoint[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-medium text-slate-500">Total emisi karbon tercatat</div>
        {/* Hero figure: proportional (not tabular) figures per the dataviz skill's guidance for
            a large standalone number. */}
        <div className="mt-1 text-3xl font-bold text-slate-900">{formatCo2(totalCo2Kg)}</div>
        <p className="mt-1 text-xs text-slate-500">
          Dihitung dari seluruh log energi warga (0,87 kg CO2 per kWh terpakai).
        </p>
      </div>

      {monthly.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-slate-500">
          Belum ada log energi untuk dihitung tren emisinya.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
            {/* left: 0, not negative -- see components/energy/energy-chart.tsx's comment: a
                negative left margin pushes Y-axis labels to a negative x inside the chart's own
                SVG, silently clipped by its default overflow:hidden viewport on narrow screens. */}
          <AreaChart data={monthly} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="carbonFill" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="totalCo2Kg"
              stroke={SERIES_COLOR}
              strokeWidth={3}
              strokeLinecap="round"
              fill="url(#carbonFill)"
              dot={{ r: 4.5, fill: ACCENT_COLOR, stroke: "#28430a", strokeWidth: 2 }}
              activeDot={{ r: 6.5, fill: "#a7d930", stroke: "#28430a", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
