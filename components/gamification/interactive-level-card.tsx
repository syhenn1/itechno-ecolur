"use client";

import { useState } from "react";
import { Gift, QrCode, Check, Lock } from "lucide-react";
import { toast } from "@/lib/toast";
import { type LevelDef } from "@/lib/gamification-data";
import { cn } from "@/lib/utils";
import { triggerButtonExplosion } from "@/lib/confetti";
import { ClaimVoucherModal, type VoucherData } from "./claim-voucher-modal";
import { useTutorial } from "@/components/tutorial/tutorial-provider";
import { Button } from "@/components/ui/button";

interface InteractiveLevelCardProps {
  levelDef: LevelDef;
  userLevel: number;
  userXp: number;
  userName: string;
  userPhone: string;
  isClaimedInitial?: boolean;
  claimedAtDate?: string;
}

export function InteractiveLevelCard({
  levelDef,
  userLevel,
  userXp,
  userName,
  userPhone,
  isClaimedInitial = false,
  claimedAtDate,
}: InteractiveLevelCardProps) {
  const tutorial = useTutorial();
  const [loading, setLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState(isClaimedInitial);
  const [activeVoucher, setActiveVoucher] = useState<VoucherData | null>(null);

  const isReached = userLevel >= levelDef.level;
  const isCurrent = userLevel === levelDef.level;

  const handleClaimPrize = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || !isReached || !levelDef.prize) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

    setLoading(true);

    try {
      const res = await fetch("/api/prize-claims/citizen-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: levelDef.level }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengklaim hadiah");
      }

      setIsClaimed(true);
      setActiveVoucher(data.voucher);
      triggerButtonExplosion(origin);
      toast.success(`Selamat! Hadiah ${levelDef.prize} berhasil Anda klaim!`);
      tutorial?.complete("claim_prize");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExistingVoucher = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerButtonExplosion(e);
    const phoneSuffix = userPhone.slice(-4) || "0000";
    const voucherCode = `ECOLUR-${levelDef.voucherCodePrefix || "RWD"}-${phoneSuffix}-LV${levelDef.level}`;

    setActiveVoucher({
      code: voucherCode,
      level: levelDef.level,
      levelName: levelDef.name,
      badgeName: levelDef.badgeName,
      badgeIcon: levelDef.badgeIcon,
      prize: levelDef.prize || "Hadiah Level",
      prizeDetail: levelDef.prizeDetail,
      recipientName: userName,
      recipientPhone: userPhone,
      claimedAt: claimedAtDate || new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  return (
    <>
      <div
        className={cn(
          "rounded-md border p-3.5 sm:p-4 transition-colors",
          isCurrent
            ? "border-emerald-400 bg-emerald-50"
            : isReached
              ? "border-slate-200 bg-white hover:border-slate-300"
              : "border-slate-200 bg-slate-50 opacity-80",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Side: Icon + Level Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div
                className={cn(
                  "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md p-1",
                  isReached ? "bg-white border border-slate-200" : "bg-slate-200/60 grayscale",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={levelDef.badgeIcon} alt={levelDef.badgeName} className="h-7 w-7 sm:h-9 sm:w-9 object-contain" />
              </div>
            </div>

            <div className="min-w-0 leading-snug">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">{levelDef.name}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-semibold text-slate-600 font-mono">
                  {levelDef.xpRequired} XP
                </span>
                {isCurrent && (
                  <span className="rounded bg-emerald-700 px-2 py-0.2 text-[8px] sm:text-[9px] font-bold text-white">
                    Level Anda
                  </span>
                )}
              </div>

              {levelDef.prize ? (
                <div className="text-[11px] sm:text-xs font-semibold text-emerald-900 flex items-center gap-1 mt-0.5 truncate">
                  <Gift className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{levelDef.prize}</span>
                </div>
              ) : (
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Tingkat Awal Warga Baru</div>
              )}
            </div>
          </div>

          {/* Right Side: Action CTA Button */}
          <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {isReached ? (
              levelDef.prize ? (
                isClaimed ? (
                  <Button variant="outline" size="sm" onClick={handleOpenExistingVoucher} className="w-full sm:w-auto">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Lihat e-voucher</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleClaimPrize}
                    loading={loading}
                    data-tutorial-zone="claim_prize"
                    className="w-full sm:w-auto"
                  >
                    Klaim hadiah
                  </Button>
                )
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                  <Check className="h-3 w-3 stroke-[3]" />
                  Tercapai
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Lock className="h-3 w-3" />
                <span>-{levelDef.xpRequired - userXp} XP</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Claim Voucher Modal */}
      <ClaimVoucherModal voucher={activeVoucher} onClose={() => setActiveVoucher(null)} />
    </>
  );
}
