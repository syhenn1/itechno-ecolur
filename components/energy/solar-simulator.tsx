"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, Sparkles, Trees, DollarSign, ArrowRight } from "lucide-react";
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
  const treesEquivalent = Math.round(yearlyCo2ReducedKg / 22); // 1 tree absorbs ~22kg CO2/year

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-300/80 bg-gradient-to-br from-white via-emerald-50/40 to-lime-50/30 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
            <Sun className="h-5 w-5 animate-spin-slow" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Kalkulator Simulasi PLTS Atap &amp; ROI</h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.2 text-[10px] font-extrabold text-amber-800 border border-amber-300">
                Interaktif
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Simulasikan potensi penghematan rupiah dan reduksi karbon jika memasang panel surya di atap rumah Anda.
            </p>
          </div>
        </div>

        <Link
          href="/ask-ai"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white/80 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95 shrink-0"
        >
          <span>Tanya Regulasi ke EcoBot</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Side: Interactive Sliders */}
        <div className="space-y-5 rounded-2xl bg-white/80 p-4 border border-emerald-100 shadow-2xs">
          {/* Bill Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">Rata-rata Tagihan Listrik Bulanan:</span>
              <span className="text-emerald-800 font-extrabold text-sm">{formatRupiah(billRupiah)}</span>
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
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">Rencana Kapasitas Panel Surya (kWp):</span>
              <span className="text-amber-700 font-extrabold text-sm">{solarCapacityKwp.toFixed(1)} kWp (~{monthlySolarKwh} kWh/bln)</span>
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
              <span>0.5 kWp (2-3 Panel)</span>
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
                  className={`rounded-xl py-1.5 text-xs font-extrabold transition-all ${
                    powerVa === va
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {va} VA
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Real-time Dynamic Results */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 text-white shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                <DollarSign className="h-4 w-4 text-yellow-300" />
                <span>Hemat per Tahun</span>
              </div>
              <div className="text-xl sm:text-2xl font-black mt-1 font-mono tracking-tight">
                {formatRupiah(yearlySavingsRupiah)}
              </div>
              <div className="text-[10px] text-emerald-100 mt-1 font-medium">
                ~{formatRupiah(monthlySavingsRupiah)} / bulan
              </div>
            </div>

            <div className="rounded-2xl border border-lime-200 bg-gradient-to-br from-[#28430a] to-[#507b00] p-4 text-white shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                <Trees className="h-4 w-4 text-lime-300" />
                <span>Emisi Terselamatkan</span>
              </div>
              <div className="text-xl sm:text-2xl font-black mt-1 font-mono tracking-tight">
                {yearlyCo2ReducedKg.toLocaleString("id-ID")} <span className="text-xs font-normal">kg CO2</span>
              </div>
              <div className="text-[10px] text-lime-200 mt-1 font-medium">
                Setara {treesEquivalent} pohon ditanam
              </div>
            </div>
          </div>

          {/* Gamification Tip Box */}
          <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-yellow-50/60 p-3.5 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900 shadow-xs">
              <Sparkles className="h-4 w-4 text-amber-700" />
            </span>
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong>Tantangan EcoLur:</strong> Warga yang memasang PLTS Atap dan mendokumentasikannya di EcoLur berhak mendapatkan bonus <strong>+300 XP</strong> dan Lencana Khusus <em>Pelopor Surya Bojong Kulur</em>!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
