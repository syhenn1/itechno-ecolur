"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, MapPin, Gift, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: "solar",
    badge: "Energi",
    title: "Pantau listrik dan simulasikan panel surya",
    description:
      "Catat konsumsi kWh bulanan, lihat grafik jejak karbon, dan hitung estimasi penghematan biaya listrik dengan simulasi panel surya atap.",
    image: "/images/service-solar-monitor.jpg",
    icon: Zap,
    highlights: ["Kalkulator PLTS", "Grafik tren CO2", "Rekomendasi AI"],
    ctaLabel: "Buka simulator energi",
    ctaHref: "/energy",
  },
  {
    id: "dispatch",
    badge: "Layanan publik",
    title: "Lapor infrastruktur dengan foto dan lokasi",
    description:
      "Laporkan jalan rusak, lampu jalan padam, atau tumpukan sampah dengan 1 foto dan titik lokasi GPS. Laporan diverifikasi dan ditindaklanjuti petugas desa.",
    image: "/images/service-field-dispatch.jpg",
    icon: MapPin,
    highlights: ["Foto dan lokasi GPS", "Verifikasi petugas", "Status dapat dipantau"],
    ctaLabel: "Kirim laporan",
    ctaHref: "/report",
  },
  {
    id: "rewards",
    badge: "Hadiah",
    title: "Kumpulkan XP, tukar dengan hadiah",
    description:
      "Setiap aksi hemat energi dan laporan menghasilkan poin XP. Naik level dari Bronze sampai Diamond, dan klaim hadiah seperti pulsa atau voucher koperasi desa.",
    image: "/images/service-citizen-rewards.jpg",
    icon: Gift,
    highlights: ["Poin XP", "Lencana pencapaian", "Voucher dan pulsa"],
    ctaLabel: "Lihat hadiah dan lencana",
    ctaHref: "/badges",
  },
];

export function PublicServicesCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[current];
  const Icon = slide.icon;

  return (
    <div className="space-y-4" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">Layanan utama EcoLur</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Slide sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
            aria-label="Slide selanjutnya"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="grid lg:grid-cols-12 items-stretch min-h-[380px]">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 border border-slate-200">
                  {slide.badge}
                </span>
                <span className="text-slate-400 font-mono">
                  {current + 1} / {SLIDES.length}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{slide.title}</h3>

              <p className="text-sm text-slate-600 leading-relaxed">{slide.description}</p>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                {slide.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 text-white px-5 py-2.5 text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md"
              >
                <span>{slide.ctaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-1.5">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrent(idx)}
                    aria-label={`Buka slide ${idx + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      current === idx ? "w-6 bg-emerald-700" : "w-1.5 bg-slate-200 hover:bg-slate-300",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full overflow-hidden bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white rounded-md p-3 border border-slate-200 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 text-white shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-slate-900">{slide.badge}</div>
                <div className="text-[11px] text-slate-500">Bojong Kulur</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
