"use client";

import { useState } from "react";
import { Flame, Check, Gift } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { triggerButtonExplosion } from "@/lib/confetti";
import { triggerXpPopup } from "@/lib/xp-popup";
import { Button } from "@/components/ui/button";

interface DailyCheckInCardProps {
  initialStreak: number;
  initialCheckedInToday: boolean;
}

export function DailyCheckInCard({ initialStreak, initialCheckedInToday }: DailyCheckInCardProps) {
  const [loading, setLoading] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(initialCheckedInToday);
  const [streak, setStreak] = useState(initialStreak);

  const handleCheckIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || checkedInToday) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

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
        triggerButtonExplosion(origin);
        if (data.xpEarned) triggerXpPopup(data.xpEarned, origin);
        toast.success(data.message, { duration: 4000 });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const currentDayIndex = Math.min(streak % 7 || 0, 6);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-50 text-orange-600">
              <Flame className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Absensi harian</h3>
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
              {streak} hari beruntun
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Login dan check-in setiap hari untuk mengumpulkan XP.
          </p>
        </div>

        <Button
          type="button"
          variant={checkedInToday ? "outline" : "primary"}
          size="lg"
          onClick={handleCheckIn}
          disabled={loading || checkedInToday}
          className={checkedInToday ? "bg-slate-100 cursor-default" : undefined}
        >
          {checkedInToday ? (
            <>
              <Check className="h-4 w-4" />
              <span>Sudah check-in hari ini</span>
            </>
          ) : loading ? (
            <span>Menyimpan...</span>
          ) : (
            <span>Klaim check-in</span>
          )}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-2 pt-3 border-t border-slate-100">
        {days.map((dayName, idx) => {
          const isDone = idx < currentDayIndex || (idx === currentDayIndex && checkedInToday);
          const isBonus = idx === 6;

          return (
            <div
              key={dayName}
              className={cn(
                "flex flex-col items-center justify-center rounded-md py-1.5 px-0.5 sm:p-2 text-center min-w-0",
                isDone ? "bg-emerald-700 text-white" : "bg-slate-50 border border-slate-200 text-slate-400",
              )}
            >
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-tight truncate block w-full">
                {dayName}
              </span>
              <div className="my-0.5 sm:my-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center">
                {isDone ? (
                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                ) : isBonus ? (
                  <Gift className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600" />
                ) : (
                  <span className="text-[10px] sm:text-xs font-mono font-bold">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
