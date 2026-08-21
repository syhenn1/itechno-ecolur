import { toast } from "sonner";
import type { BadgeDef } from "@/lib/gamification-data";

export interface ClientGamificationResult {
  awarded: boolean;
  leveledUp: boolean;
  newLevel?: number;
  newBadges: BadgeDef[];
}

/** Call from a form's success handler with whatever `gamification` field the API response
 *  included — shows a level-up toast and one toast per newly-earned badge, if any. */
export function showGamificationToasts(gamification: ClientGamificationResult | null | undefined) {
  if (!gamification) return;

  if (gamification.leveledUp && gamification.newLevel) {
    toast.success(`Naik ke Level ${gamification.newLevel}!`, {
      description: "Terus aktif untuk naik level dan dapatkan hadiah berikutnya.",
    });
  }

  for (const badge of gamification.newBadges) {
    toast.success(`Lencana baru: ${badge.name}`, { description: badge.description });
  }
}
