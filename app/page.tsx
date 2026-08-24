import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  MapPin,
  Gift,
  Bot,
  ArrowRight,
  Sparkles,
  SunMedium,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PublicServicesCarousel } from "@/components/landing/public-services-carousel";

const ROLE_HOME: Record<string, string> = {
  CITIZEN: "/energy",
  OFFICER: "/incoming-reports",
  ADMIN: "/dashboard",
};

const PILLARS = [
  {
    icon: Zap,
    title: "Pemantauan Energi & PLTS",
    description:
      "Catat kWh bulanan, pantau grafik emisi CO2, serta simulasikan penghematan listrik mandiri dengan panel surya rooftop.",
    badge: "Efisiensi Energi",
    href: "/login?redirect=/energy",
  },
  {
    icon: MapPin,
    title: "Lapor Masalah Infrastruktur",
    description:
      "Laporkan jalan rusak, tumpukan sampah, dan lampu PJU padam hanya dengan 1 foto dan titik koordinat GPS presisi.",
    badge: "Tanggap 1x24 Jam",
    href: "/login?redirect=/report",
  },
  {
    icon: Gift,
    title: "Apresiasi & Hadiah Warga",
    description:
      "Raih poin XP dari aksi hemat listrik, kumpulkan lencana Bronze hingga Diamond, dan klaim e-voucher sembako MBG.",
    badge: "Reward Nyata",
    href: "/login?redirect=/badges",
  },
  {
    icon: Bot,
    title: "Asisten AI Keberlanjutan",
    description:
      "Konsultasikan tips hemat energi, tata cara perizinan PLTS, hingga SOP penanganan aduan warga secara instan 24/7.",
    badge: "Kecerdasan Buatan",
    href: "/login?redirect=/ask-ai",
  },
];

export default async function HomePage() {
  const [session, totalKwhSum, totalReportsCount, resolvedReportsCount, citizenCount] =
    await Promise.all([
      getSession(),
      prisma.energyLog.aggregate({ _sum: { consumptionKwh: true } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.user.count({ where: { role: "CITIZEN" } }),
    ]);

  if (session) {
    redirect(ROLE_HOME[session.role] ?? "/login");
  }

  // Live real aggregated statistics from PostgreSQL database
  const totalKwh = Math.round(totalKwhSum._sum.consumptionKwh ?? 0);
  const resolvedRate =
    totalReportsCount > 0
      ? ((resolvedReportsCount / totalReportsCount) * 100).toFixed(1)
      : "100";
  const totalCitizens = citizenCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header Navbar with Exact Legacy 2-Line Typography */}
      <header className="sticky top-0 z-40 border-b border-emerald-100/90 bg-white/95 backdrop-blur-xl shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 gap-2">
          {/* Brand & Emblem */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0 transition-transform active:scale-95">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/ecolur-logo.png"
              alt="Logo EcoLur"
              className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full object-cover shadow-xs ring-1 ring-emerald-500/20"
            />
            <div className="flex flex-col leading-none">
              <span className="text-base sm:text-lg font-bold text-emerald-800 tracking-tight">EcoLur</span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5">Bojong Kulur &middot; Bogor</span>
            </div>
          </Link>

          {/* Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md eco-glow-leaf hover:opacity-95 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Masuk Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Landing Content Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 py-6 sm:py-12 space-y-12 sm:space-y-16">
        {/* Hero Section (Split View 12 Cols) */}
        <section className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline & Action Buttons (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3.5 py-1 text-xs font-extrabold text-emerald-800 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Platform Cerdas Desa Hijau Mandiri Energi</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Mewujudkan <span className="text-emerald-800">Desa Bojong Kulur</span> Bersih, Ramah Energi &amp; Responsif.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                Portal digital terpadu bagi warga Desa Bojong Kulur untuk memantau konsumsi listrik, simulasi PLTS atap mandiri, melaporkan masalah lingkungan secara spasial, serta menukarkan poin aksi hijau dengan paket sembako bergizi resmi.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime text-white px-7 py-3.5 text-sm font-black shadow-lg eco-glow-leaf hover:opacity-95 active:scale-95 transition-all text-center cursor-pointer"
              >
                <span>Mulai Masuk Aplikasi Warga</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?redirect=/report"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-center cursor-pointer"
              >
                <MapPin className="h-4 w-4 text-emerald-700" />
                <span>Lapor Masalah Lingkungan</span>
              </Link>
            </div>

            {/* Live Village Impact Stats Row - 100% Aggregated from Real Database */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/80">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="text-lg sm:text-2xl font-black text-emerald-900 font-mono">
                  {totalKwh.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] font-semibold text-slate-500">kWh Tercatat Warga</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="text-lg sm:text-2xl font-black text-emerald-900 font-mono">
                  {resolvedRate}%
                </div>
                <div className="text-[11px] font-semibold text-slate-500">Laporan Tertangani</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="text-lg sm:text-2xl font-black text-emerald-900 font-mono">
                  {totalCitizens.toLocaleString("id-ID")}+
                </div>
                <div className="text-[11px] font-semibold text-slate-500">Warga Terdaftar Aktif</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Smart Village Frame (5 Cols) */}
          <div className="lg:col-span-5 relative animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-200 bg-slate-950 shadow-2xl group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-smart-village.jpg"
                alt="Inovasi Desa Hijau Bojong Kulur"
                className="w-full h-[380px] sm:h-[440px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

              {/* Floating Live Telemetry Badge on Image */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <SunMedium className="h-4 w-4 text-amber-600 animate-spin-slow" />
                    Bojong Kulur Smart Energy Grid
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                    Aktif Real-Time
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Integrasi simulasi PLTS Rooftop, log konsumsi PLN, dan sistem respon cepat petugas lapangan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Public Services Interactive Carousel Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <PublicServicesCarousel />
        </section>

        {/* 4 Core Pillars Grid */}
        <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              4 Pilar Solusi Cerdas EcoLur
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dirancang khusus untuk mendukung terwujudnya tujuan pembangunan berkelanjutan (SDG 7, 9, 11) di tingkat desa.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-2xs">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                        {p.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{p.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                  </div>

                  <Link
                    href={p.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors pt-2 border-t border-slate-100"
                  >
                    <span>Jelajahi Fitur</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Civic Call-to-Action Banner */}
        <section className="rounded-3xl border border-emerald-300 bg-gradient-to-r from-eco-forest via-eco-leaf to-emerald-700 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden text-center sm:text-left">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-300">
                Mari Bergerak Bersama
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Jadilah Bagian dari Warga Hijau Bojong Kulur Hari Ini!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Login dengan nomor ponsel Anda tanpa ribet password, catat penghematan energi Anda, dan klaim berbagai apresiasi dari desa.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-emerald-950 px-8 py-4 text-sm font-black shadow-lg hover:bg-emerald-50 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span>Masuk Sekarang &rarr;</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Official Government Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-slate-600 text-xs mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/ecolur-logo.png"
              alt="Logo EcoLur"
              className="h-8 w-8 rounded-full object-cover shadow-2xs"
            />
            <div>
              <div className="font-extrabold text-slate-900">Pemerintah Desa Bojong Kulur</div>
              <div className="text-[11px] text-slate-500">Kecamatan Gunung Putri, Kabupaten Bogor, Jawa Barat 16969</div>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-500">
            &copy; 2026 EcoLur &middot; Sistem Inovasi Digital Desa Berkelanjutan.
          </div>
        </div>
      </footer>
    </div>
  );
}
