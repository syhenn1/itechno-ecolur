import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, MapPin, Gift, Bot } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PublicServicesCarousel } from "@/components/landing/public-services-carousel";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { FlowButton } from "@/components/ui/flow-button";
import { Button } from "@/components/ui/button";

const ROLE_HOME: Record<string, string> = {
  CITIZEN: "/energy",
  OFFICER: "/incoming-reports",
  ADMIN: "/dashboard",
};

const PILLARS = [
  {
    icon: Zap,
    title: "Catat konsumsi listrik",
    description:
      "Input meteran kWh setiap bulan, lihat grafik tren, dan dapatkan rekomendasi hemat energi dari AI berdasarkan riwayat Anda.",
  },
  {
    icon: MapPin,
    title: "Lapor masalah infrastruktur",
    description:
      "Laporkan jalan rusak, sampah menumpuk, atau lampu jalan mati dengan foto dan titik lokasi GPS.",
  },
  {
    icon: Gift,
    title: "Kumpulkan poin dan hadiah",
    description:
      "Dapat XP dari setiap laporan dan pencatatan energi, naik level, dan klaim hadiah seperti pulsa atau voucher koperasi desa.",
  },
  {
    icon: Bot,
    title: "Tanya asisten AI",
    description:
      "Tanyakan tarif listrik PLN, cara pasang panel surya, atau prosedur pelaporan lewat chatbot EcoBot.",
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

  const totalKwh = Math.round(totalKwhSum._sum.consumptionKwh ?? 0);
  const resolvedRate = totalReportsCount > 0 ? Math.round((resolvedReportsCount / totalReportsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/ecolur-logo.png"
              alt="Logo EcoLur"
              className="h-8 w-8 shrink-0 rounded-md object-cover"
            />
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-slate-900">EcoLur</span>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5">Bojong Kulur, Bogor</span>
            </div>
          </Link>

          <FlowButton text="Masuk" href="/login" />
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200">
        <HeroCarousel />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-8 sm:pb-12">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Catat konsumsi listrik dan laporkan masalah infrastruktur di Bojong Kulur.
              </h1>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xl">
                EcoLur adalah platform untuk warga Bojong Kulur: input meteran listrik bulanan untuk
                rekomendasi hemat energi dari AI, dan laporkan jalan rusak atau sampah menumpuk lengkap
                dengan foto dan lokasi. Setiap laporan bisa dipantau statusnya sampai selesai.
              </p>

              <div className="pointer-events-auto flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/login">
                  <Button variant="glass" size="lg" className="w-full sm:w-auto">
                    Masuk atau daftar
                  </Button>
                </Link>
                <Link href="/login?redirect=/report">
                  <Button variant="glass" size="lg" className="w-full sm:w-auto">
                    <MapPin className="h-4 w-4" />
                    Lapor masalah
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-10 sm:py-14 space-y-14">
        <section className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 rounded-md border border-slate-200 text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{totalKwh.toLocaleString("id-ID")}</div>
            <div className="text-xs text-slate-500">kWh tercatat</div>
          </div>
          <div className="p-4 rounded-md border border-slate-200 text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{resolvedRate}%</div>
            <div className="text-xs text-slate-500">Laporan selesai</div>
          </div>
          <div className="p-4 rounded-md border border-slate-200 text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{citizenCount}</div>
            <div className="text-xs text-slate-500">Warga terdaftar</div>
          </div>
        </section>

        <section>
          <PublicServicesCarousel />
        </section>

        <section className="space-y-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-slate-900">Yang bisa Anda lakukan di EcoLur</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="rounded-md border border-slate-200 p-5 space-y-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-md border border-emerald-200 bg-emerald-50 p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Masuk dengan nomor HP, tanpa kata sandi.
              </h2>
              <p className="text-sm text-slate-700">
                Verifikasi lewat kode OTP. Akun baru dibuat otomatis saat pertama kali masuk.
              </p>
            </div>

            <div className="shrink-0">
              <FlowButton text="Masuk sekarang" href="/login" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-slate-600 text-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/ecolur-logo.png"
              alt="Logo EcoLur"
              className="h-7 w-7 rounded-md object-cover"
            />
            <div>
              <div className="font-semibold text-slate-900">Pemerintah Desa Bojong Kulur</div>
              <div className="text-[11px] text-slate-500">Kecamatan Gunung Putri, Kabupaten Bogor, Jawa Barat</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <Link href="/privacy" className="hover:text-slate-700">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="hover:text-slate-700">
              Syarat dan Ketentuan
            </Link>
            <span>2026 EcoLur</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
