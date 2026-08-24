"use client";

import { useState } from "react";
import { Flame, Sparkles, Check, Gift } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { triggerButtonExplosion } from "@/lib/confetti";

interface DailyCheckInCardProps {
  initialStreak?: number;
}

export function DailyCheckInCard({ initialStreak = 3 }: DailyCheckInCardProps) {
  const [loading, setLoading] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [streak, setStreak] = useState(initialStreak);

  const handleCheckIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || checkedInToday) return;

    // Capture button coordinate before async boundary
    const rect = e.currentTarget.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

    triggerButtonExplosion(origin);
    setLoading(true);

    try {
      const res = await fetch("/api/gamification/check-in", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan absensi");
      }

      setCheckedInToday(true);
      if (data.streakDays) setStreak(data.streakDays);

      if (data.alreadyClaimed) {
        toast.info(data.message);
      } else {
        toast.success(data.message, {
          duration: 4000,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const currentDayIndex = Math.min(streak % 7 || 3, 6);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-lime-50/30 p-5 shadow-xs">
      {/* Decorative glow in corner */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-100 text-orange-600 shadow-xs">
              <Flame className="h-4 w-4 fill-orange-500 text-orange-500 animate-bounce-slow" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">Absensi Hijau Harian</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
              <Flame className="h-3 w-3 fill-orange-500 text-orange-500" />
              {streak} Hari Beruntun
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Login dan check-in setiap hari untuk mengumpulkan <strong>+15 XP</strong> dan bonus akhir pekan!
          </p>
        </div>

        <button
          type="button"
          onClick={handleCheckIn}
          disabled={loading || checkedInToday}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95",
            checkedInToday
              ? "bg-slate-100 text-slate-500 border border-slate-200 cursor-default"
              : "bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime text-white hover:opacity-95 eco-glow-leaf"
          )}
        >
          {checkedInToday ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Sudah Check-In Hari Ini</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>{loading ? "Menyimpan..." : "Klaim Check-In (+15 XP)"}</span>
            </>
          )}
        </button>
      </div>

      {/* 7-Day Visual Streak Tracker */}
      <div className="mt-3 sm:mt-4 grid grid-cols-7 gap-1 sm:gap-2 pt-2 border-t border-emerald-100/80">
        {days.map((dayName, idx) => {
          const isDone = idx < currentDayIndex || (idx === currentDayIndex && checkedInToday);
          const isCurrent = idx === currentDayIndex && !checkedInToday;
          const isBonus = idx === 6;

          return (
            <div
              key={idx}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl sm:rounded-2xl py-1.5 px-0.5 sm:p-2 text-center transition-all min-w-0",
                isDone
                  ? "bg-emerald-600 text-white shadow-xs"
                  : isCurrent
                    ? "bg-amber-100 border border-amber-400 text-amber-900 animate-pulse-glow"
                    : "bg-white/80 border border-slate-200 text-slate-400"
              )}
            >
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight truncate block w-full">{dayName}</span>
              <div className="my-0.5 sm:my-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center">
                {isDone ? (
                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                ) : isBonus ? (
                  <Gift className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600" />
                ) : (
                  <span className="text-[10px] sm:text-xs font-mono font-bold">15</span>
                )}
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold">{isBonus ? "+50" : "+15"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
