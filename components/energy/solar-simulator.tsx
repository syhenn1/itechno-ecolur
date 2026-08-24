"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, Sparkles, Trees, DollarSign, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export function SolarSimulator() {
  const [billRupiah, setBillRupiah] = useState<number>(750000);
  const [solarCapacityKwp, setSolarCapacityKwp] = useState<number>(2.0);
  const [powerVa, setPowerVa] = useState<number>(2200);

  // Approximate solar generation in Bogor/West Java: ~3.6 kWh / kWp / day
  const monthlySolarKwh = Math.round(solarCapacityKwp * 3.6 * 30);
  const tariffPerKwh = powerVa >= 1300 ? 1444.7 : 1352;
  const monthlySavingsRupiah = Math.min(billRupiah * 0.75, monthlySolarKwh * tariffPerKwh);
  const yearlySavingsRupiah = monthlySavingsRupiah * 12;
  const yearlyCo2ReducedKg = Math.round((monthlySolarKwh * 12) * 0.85);
  const treesEquivalent = Math.round(yearlyCo2ReducedKg / 22);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs">
            <Sun className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900">Kalkulator Simulasi PLTS Atap &amp; ROI</h3>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                Edukasi Energi Bersih
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulasikan potensi penghematan biaya listrik dan penurunan emisi karbon bila memasang panel surya di atap.
            </p>
          </div>
        </div>

        <Link
          href="/ask-ai"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all active:scale-95 shrink-0"
        >
          <span>Tanya Regulasi ke EcoBot</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-2xl bg-slate-50/80 p-5 border border-slate-200/80">
          {/* Bill Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5 flex-wrap gap-1">
              <span className="text-slate-700">Tagihan Listrik Bulanan Saat Ini:</span>
              <span className="text-emerald-800 font-extrabold font-mono text-sm">{formatRupiah(billRupiah)}</span>
            </div>
            <input
              type="range"
              min={200000}
              max={3000000}
              step={50000}
              value={billRupiah}
              onChange={(e) => setBillRupiah(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Rp200 rb</span>
              <span>Rp1.5 jt</span>
              <span>Rp3 jt</span>
            </div>
          </div>

          {/* Solar Capacity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5 flex-wrap gap-1">
              <span className="text-slate-700">Kapasitas PLTS Atap (kWp):</span>
              <span className="text-amber-800 font-extrabold font-mono text-sm">
                {solarCapacityKwp.toFixed(1)} kWp (~{monthlySolarKwh} kWh/bln)
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5.0}
              step={0.5}
              value={solarCapacityKwp}
              onChange={(e) => setSolarCapacityKwp(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.5 kWp (2 Panel)</span>
              <span>2.0 kWp</span>
              <span>5.0 kWp (Atap Luas)</span>
            </div>
          </div>

          {/* Power VA Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Golongan Daya Listrik Rumah:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[900, 1300, 2200, 3500].map((va) => (
                <button
                  key={va}
                  type="button"
                  onClick={() => setPowerVa(va)}
                  className={`rounded-xl py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                    powerVa === va
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {va} VA
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Results (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 text-white shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-100">
                <DollarSign className="h-4 w-4 text-yellow-300" />
                <span>Hemat / Tahun</span>
              </div>
              <div className="text-lg font-black mt-1 font-mono tracking-tight break-words">
                {formatRupiah(yearlySavingsRupiah)}
              </div>
              <div className="text-[10px] text-emerald-100 mt-0.5">
                ~{formatRupiah(monthlySavingsRupiah)} / bln
              </div>
            </div>

            <div className="rounded-2xl border border-lime-300 bg-gradient-to-br from-[#28430a] to-[#466e00] p-4 text-white shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-lime-200">
                <Trees className="h-4 w-4 text-lime-300" />
                <span>Reduksi CO2</span>
              </div>
              <div className="text-lg font-black mt-1 font-mono tracking-tight">
                {yearlyCo2ReducedKg.toLocaleString("id-ID")} <span className="text-xs font-normal">kg CO2</span>
              </div>
              <div className="text-[10px] text-lime-200 mt-0.5">
                Setara {treesEquivalent} pohon ditanam
              </div>
            </div>
          </div>

          {/* Gamification Challenge Box */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
            <Sparkles className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <div className="leading-relaxed text-[11px]">
              <strong>Tantangan Komunitas:</strong> Warga Bojong Kulur yang memasang PLTS Atap dapat melaporkan dokumentasinya untuk bonus <strong>+300 XP</strong> &amp; Lencana Khusus!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
