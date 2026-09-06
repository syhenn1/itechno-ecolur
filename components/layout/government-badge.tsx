import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Attribution line for the dashboard's real-world pilot location. Deliberately does NOT use the
 * actual Kabupaten Bogor government emblem/logo -- EcoLur is a fictional-village competition
 * submission (Jatikulur), not an official government system, so displaying the real coat of arms
 * would misrepresent it as one. A generic landmark icon carries the same "this is a government-
 * style dashboard" cue without borrowing a real institution's mark.
 */
export function GovernmentBadge({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-xs font-medium text-slate-600", className)}>
      <Landmark className="h-4 w-4 text-emerald-700" aria-hidden="true" />
      <span>Pemerintah Kabupaten Bogor &middot; Kecamatan Gunung Putri</span>
    </div>
  );
}
