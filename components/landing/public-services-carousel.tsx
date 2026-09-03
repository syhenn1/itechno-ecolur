"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  MapPin,
  Gift,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: "solar",
    badge: "Efisiensi Energi & PLTS",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    title: "Pemantauan Listrik Rumah & Simulasi Panel Surya (PLTS Mandiri)",
    description:
      "Catat konsumsi kWh bulanan keluarga Anda, pantau grafik jejak karbon secara real-time, dan hitung estimasi penghematan biaya listrik hingga 40% dengan simulasi kalkulator PLTS Atap ramah lingkungan.",
    image: "/images/service-solar-monitor.jpg",
    icon: Zap,
    highlights: ["Kalkulator PLTS Otomatis", "Grafik Tren CO2", "Rekomendasi AI"],
    ctaLabel: "Buka Simulator Energi",
    ctaHref: "/energy",
  },
  {
    id: "dispatch",
    badge: "Layanan Tanggap Cepat",
    badgeColor: "bg-sky-100 text-sky-900 border-sky-300",
    title: "Lapor Infrastruktur Cepat & Penugasan Petugas Spasial (KNN)",
    description:
      "Temukan jalan rusak, lampu PJU padam, atau tumpukan sampah di lingkungan Anda? Laporkan hanya dengan 1 foto dan pin GPS presisi. Tim siaga Desa Bojong Kulur siap merespons secara terukur dalam 1x24 jam.",
    image: "/images/service-field-dispatch.jpg",
    icon: MapPin,
    highlights: ["Triase Spasial KNN", "Foto & Lokasi GPS", "Respons Siaga 1x24 Jam"],
    ctaLabel: "Kirim Laporan Warga",
    ctaHref: "/report",
  },
  {
    id: "rewards",
    badge: "Apresiasi & Hadiah Warga",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    title: "Tukar Poin Aksi Hijau dengan Voucher Sembako & Pulsa Resmi",
    description:
      "Setiap aksi hemat energi dan laporan lingkungan menghasilkan poin XP. Raih jenjang lencana dari Bronze hingga Diamond Hero, serta klaim e-voucher sembako MBG bergizi dan token listrik di Kantor Desa Bojong Kulur.",
    image: "/images/service-citizen-rewards.jpg",
    icon: Gift,
    highlights: ["Voucher Sembako MBG", "Token Listrik Gratis", "Piagam Penghargaan"],
    ctaLabel: "Lihat Hadiah & Lencana",
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
    <div
      className="space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-black text-emerald-800 border border-emerald-200 mb-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Layanan Cerdas &amp; Inovasi Publik Desa
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Program Prioritas Desa Bojong Kulur
          </h2>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Slide sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
            aria-label="Slide selanjutnya"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Big Feature Carousel Slide */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md transition-all">
        <div className="grid lg:grid-cols-12 items-stretch min-h-[420px]">
          {/* Left Text Column (7 Cols) */}
          <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-2xs",
                    slide.badgeColor
                  )}
                >
                  {slide.badge}
                </span>
                <span className="text-xs text-slate-400 font-semibold font-mono">
                  0{current + 1} / 0{SLIDES.length}
                </span>
              </div>

              <h3 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                {slide.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {slide.description}
              </p>

              {/* Highlights Pill Row */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {slide.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 border border-slate-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button & Slide Switcher Tabs */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime text-white px-6 py-3 text-xs sm:text-sm font-extrabold shadow-md eco-glow-leaf hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <span>{slide.ctaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Progress Indicator Dots */}
              <div className="flex items-center gap-2">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrent(idx)}
                    aria-label={`Buka slide ${idx + 1}`}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-300 cursor-pointer",
                      current === idx ? "w-8 bg-emerald-600 shadow-xs" : "w-2.5 bg-slate-200 hover:bg-slate-300"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Image Column (5 Cols) */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden bg-slate-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white/10 lg:via-transparent lg:to-transparent" />
            
            {/* Floating Mini Badge on Image */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-white/40 shadow-lg flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <div className="text-xs font-black text-slate-900">{slide.badge}</div>
                <div className="text-[10px] text-slate-500 font-medium">Bojong Kulur Mandiri Energi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
