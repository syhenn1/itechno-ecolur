"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Official Kabupaten Bogor emblem, with graceful fallback to a generic icon if the file is ever
 * missing/renamed. The real logo now lives at public/icons/Lambang_Kabupaten_Bogor.svg.webp.
 */
export function GovernmentBadge({ className }: { className?: string }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className={cn("inline-flex items-center gap-2 text-xs font-medium text-slate-600", className)}>
      {!logoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/icons/Lambang_Kabupaten_Bogor.svg.webp"
          alt="Lambang Kabupaten Bogor"
          className="h-5 w-5 object-contain drop-shadow-xs"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <Landmark className="h-4 w-4 text-emerald-700" aria-hidden="true" />
      )}
      <span>Pemerintah Kabupaten Bogor &middot; Kecamatan Gunung Putri</span>
    </div>
  );
}
