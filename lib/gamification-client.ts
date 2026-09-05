import { toast } from "@/lib/toast";
import type { BadgeDef } from "@/lib/gamification-data";
import { triggerButtonExplosion } from "@/lib/confetti";
import { triggerXpPopup, type XpPopupOrigin } from "@/lib/xp-popup";

export interface ClientGamificationResult {
  awarded: boolean;
  amount?: number;
  leveledUp: boolean;
  newLevel?: number;
  newBadges: BadgeDef[];
}

/** Call from a form's success handler with whatever `gamification` field the API response
 *  included — triggers a confetti burst + a floating "+XX EXP" badge, plus a level-up toast and
 *  one toast per newly-earned badge. Pass `origin` (same normalized 0-1 shape used by
 *  lib/confetti.ts) to anchor the effects near where the citizen actually clicked; omitted, they
 *  play from the center of the screen. */
export function showGamificationToasts(
  gamification: ClientGamificationResult | null | undefined,
  origin?: XpPopupOrigin | null,
) {
  if (!gamification) return;

  if (gamification.awarded || gamification.leveledUp || (gamification.newBadges && gamification.newBadges.length > 0)) {
    triggerButtonExplosion(origin ?? null);
  }

  if (gamification.awarded && gamification.amount) {
    triggerXpPopup(gamification.amount, origin);
  }

  if (gamification.leveledUp && gamification.newLevel) {
    toast.success(`Selamat! Anda Naik ke Level ${gamification.newLevel}!`, {
      description: "Terus aktif beraksi hijau untuk mengklaim hadiah berikutnya.",
    });
  }

  for (const badge of gamification.newBadges) {
    toast.success(`Lencana baru: ${badge.name}`, { description: badge.description });
  }
}
