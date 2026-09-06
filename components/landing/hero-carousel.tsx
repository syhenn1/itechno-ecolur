"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Reuses the same 4 real photos already in the project (the single static hero image, plus the
// 3 used further down in the services carousel) — rotating through all of them here instead of
// showing just one gives the hero section actual visual variety without needing new assets.
const HERO_IMAGES = [
  { src: "/images/hero-smart-village.jpg", alt: "Suasana Desa Jatikulur" },
  { src: "/images/service-solar-monitor.jpg", alt: "Pemantauan konsumsi listrik dan panel surya" },
  { src: "/images/service-field-dispatch.jpg", alt: "Petugas menindaklanjuti laporan warga" },
  { src: "/images/service-citizen-rewards.jpg", alt: "Warga mengumpulkan XP dan hadiah" },
];

const SLIDE_DURATION_MS = 5000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => setCurrent((prev) => (prev + 1) % HERO_IMAGES.length), SLIDE_DURATION_MS);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="relative h-[420px] sm:h-[480px] lg:h-[560px] w-full overflow-hidden bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {HERO_IMAGES.map((image, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out",
            idx === current ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {/* Deliberate exception to the app-wide no-gradient rule: a dark scrim behind hero text on
          a photo, same category as the services carousel's own card below. */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5" aria-hidden="true">
        {HERO_IMAGES.map((image, idx) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setCurrent(idx)}
            aria-label={`Tampilkan foto ${idx + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              idx === current ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </div>
  );
}
