import { toast } from "sonner";
import type { BadgeDef } from "@/lib/gamification-data";
import { triggerButtonExplosion } from "@/lib/confetti";

export interface ClientGamificationResult {
  awarded: boolean;
  leveledUp: boolean;
  newLevel?: number;
  newBadges: BadgeDef[];
}

/** Call from a form's success handler with whatever `gamification` field the API response
 *  included — triggers celebration explosion, shows a level-up toast and one toast per newly-earned badge. */
export function showGamificationToasts(gamification: ClientGamificationResult | null | undefined) {
  if (!gamification) return;

  if (gamification.awarded || gamification.leveledUp || (gamification.newBadges && gamification.newBadges.length > 0)) {
    triggerButtonExplosion(null);
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
