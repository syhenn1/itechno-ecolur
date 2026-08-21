import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, MapPin, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const ROLE_HOME: Record<string, string> = {
  CITIZEN: "/energy",
  OFFICER: "/incoming-reports",
  ADMIN: "/dashboard",
};

const FEATURES = [
  {
    icon: Zap,
    title: "Pantau Energi & Gamifikasi",
    body: "Catat kWh bulanan, pantau grafik emisi CO2, dan naik level dari Bronze hingga Diamond untuk mendapatkan hadiah nyata.",
  },
  {
    icon: MapPin,
    title: "Lapor Infrastruktur Berbasis Peta",
    body: "Laporkan jalan berlubang, tumpukan sampah, dan saluran drainase dengan foto & pin GPS presisi.",
  },
  {
    icon: ShieldCheck,
    title: "Transparansi Audit Log",
    body: "Setiap laporan terdistribusi dengan algoritma QuadTree & prioritas cerdas agar penanganan petugas terukur.",
  },
];

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.role] ?? "/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      {/* Official Government & App Emblem */}
      <div className="animate-fade-in-up flex items-center justify-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/Lambang_Kabupaten_Bogor.svg.webp"
          alt="Lambang Kabupaten Bogor"
          className="h-12 w-12 object-contain drop-shadow-sm"
        />
        <div className="text-left border-l border-slate-300 pl-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Pemerintah Kabupaten Bogor
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            Kecamatan Gunung Putri &middot; Desa Bojong Kulur
          </div>
        </div>
      </div>

      <div
        className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs"
        style={{ animationDelay: "60ms" }}
      >
        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
        Solusi Digital Berkelanjutan (SDG 7, 9, 11) &middot; ITechno Cup 2026
      </div>

      <div className="animate-fade-in-up space-y-4 max-w-2xl" style={{ animationDelay: "120ms" }}>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-5xl tracking-tight leading-tight">
          Satu Platform untuk <span className="text-emerald-700">Energi Bersih</span> &amp;{" "}
          <span className="text-emerald-800">Layanan Publik</span> Warga.
        </h1>
        <p className="text-balance text-sm sm:text-base text-slate-600 leading-relaxed">
          <strong>EcoLur</strong> mengintegrasikan pemantauan konsumsi listrik dengan asisten AI RAG, sistem reward leveling 5 tingkat (Bronze &rarr; Diamond), dan pelaporan infrastruktur desa yang transparan.
        </p>
      </div>

      <div className="animate-fade-in-up flex items-center gap-3" style={{ animationDelay: "180ms" }}>
        <Link href="/login">
          <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
            Mulai Sekarang <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Feature cards with new Eco palette accents */}
      <div className="grid gap-4 pt-6 text-left sm:grid-cols-3 w-full">
        {FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className="animate-fade-in-up rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md"
            style={{ animationDelay: `${240 + index * 80}ms` }}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <feature.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-base font-bold text-slate-900 mb-1">{feature.title}</div>
            <p className="text-xs text-slate-600 leading-relaxed">{feature.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
