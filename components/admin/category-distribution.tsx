"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface CategoryPoint {
  category: string;
  label: string;
  count: number;
}

// Fixed categorical order (never reassigned by count/rank — see the dataviz skill's "color
// follows the entity" rule), the validated default 5-slot palette. Contrast for slots 3/4/5 sits
// below 3:1 on a white card, which is why the legend below always carries a visible text label
// and count next to the swatch instead of relying on the color alone.
const SLOT_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"];

interface TooltipProps {
  active?: boolean;
  payload?: { payload: CategoryPoint & { percent: number } }[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white px-3.5 py-2.5 text-xs shadow-md">
      <div className="font-bold text-slate-900">{point.label}</div>
      <div className="font-mono font-extrabold text-slate-700">
        {point.count} laporan &middot; {point.percent.toFixed(0)}%
      </div>
    </div>
  );
}

/** Donut chart for report category share — a legitimate pie/donut use (part-to-whole, <= 6
 *  segments, see the dataviz skill) unlike the RT/RW breakdown, which has too many wilayah for a
 *  pie and is ranked as a bar chart instead (see RtRwDistributionChart). */
export function CategoryDistributionChart({ data }: { data: CategoryPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        Belum ada laporan untuk dihitung kategorinya.
      </div>
    );
  }

  const withPercent = data.map((d) => ({ ...d, percent: (d.count / total) * 100 }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <ResponsiveContainer width="100%" height={200} className="sm:max-w-[200px]">
        <PieChart>
          <Pie
            data={withPercent}
            dataKey="count"
            nameKey="label"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={2}
            stroke="#ffffff"
          >
            {withPercent.map((entry, i) => (
              <Cell key={entry.category} fill={SLOT_COLORS[i % SLOT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend doubles as the table-view twin required alongside any color encoding — every
          value stays reachable without hovering the chart. */}
      <ul className="w-full flex-1 space-y-1.5">
        {withPercent.map((entry, i) => (
          <li key={entry.category} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: SLOT_COLORS[i % SLOT_COLORS.length] }}
                aria-hidden="true"
              />
              <span className="truncate font-medium text-slate-700">{entry.label}</span>
            </span>
            <span className="shrink-0 font-mono font-bold text-slate-900">
              {entry.count} <span className="font-normal text-slate-500">({entry.percent.toFixed(0)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
