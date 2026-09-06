"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { getLevelDef } from "@/lib/gamification-data";
import { useTutorial } from "@/components/tutorial/tutorial-provider";

interface PrizeClaimRowProps {
  claimId: string;
  userName: string;
  userPhone: string;
  level: number;
  prize: string;
}

export function PrizeClaimRow({ claimId, userName, userPhone, level, prize }: PrizeClaimRowProps) {
  const router = useRouter();
  const tutorial = useTutorial();
  const [loading, setLoading] = useState(false);
  const levelDef = getLevelDef(level);

  async function handleClaim() {
    setLoading(true);
    try {
      const res = await fetch(`/api/prize-claims/${claimId}/claim`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menandai klaim");
      toast.success(`Hadiah untuk ${userName} ditandai sudah diberikan`);
      tutorial?.complete("admin_prize_claim");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li
      data-tutorial-zone="admin_prize_claim"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={levelDef.badgeIcon}
            alt={levelDef.badgeName}
            className="h-8 w-8 object-contain"
          />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">
            {userName}{" "}
            <span className="font-semibold text-emerald-800 text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 ml-1">
              Level {level} ({levelDef.badgeName})
            </span>
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            Hadiah: <strong className="text-slate-800">{prize}</strong> &middot; {userPhone}
          </div>
        </div>
      </div>
      <Button type="button" size="sm" variant="outline" loading={loading} onClick={handleClaim}>
        Tandai Diberikan
      </Button>
    </li>
  );
}
