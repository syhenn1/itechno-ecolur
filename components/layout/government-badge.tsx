"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Official EcoLur emblem badge (/icons/ecolur-logo.svg)
 * with graceful fallback.
 */
export function GovernmentBadge({ className }: { className?: string }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className={cn("inline-flex items-center gap-2 text-xs font-medium text-slate-600", className)}>
      {!logoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/icons/ecolur-logo.png"
          alt="Logo EcoLur"
          className="h-5 w-5 rounded-full object-cover drop-shadow-xs"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <Landmark className="h-4 w-4 text-emerald-700" aria-hidden="true" />
      )}
      <span>Pemerintah Kabupaten Bogor &middot; Kecamatan Gunung Putri</span>
    </div>
  );
}
