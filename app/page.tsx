import { redirect } from "next/navigation";
import Link from "next/link";
import { Leaf, Zap, MapPin, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const ROLE_HOME: Record<string, string> = {
  CITIZEN: "/energy",
  OFFICER: "/incoming-reports",
  ADMIN: "/dashboard",
};

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.role] ?? "/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div className="flex items-center gap-2 text-emerald-600">
        <Leaf className="h-8 w-8" aria-hidden="true" />
        <span className="text-2xl font-semibold text-slate-900">EcoLur</span>
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Pantau energi rumah tangga, laporkan masalah kota — dalam satu platform.
        </h1>
        <p className="text-balance text-slate-600">
          EcoLur membantu warga memantau konsumsi listrik dengan rekomendasi hemat energi berbasis AI, dan
          melaporkan masalah infrastruktur kota dengan status yang transparan hingga selesai.
        </p>
      </div>
      <Link href="/login">
        <Button size="lg">Masuk / Daftar</Button>
      </Link>
      <div className="grid gap-4 pt-8 text-left sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Zap className="mb-2 h-5 w-5 text-emerald-600" aria-hidden="true" />
          <div className="text-sm font-medium text-slate-900">Pantau Energi</div>
          <p className="text-sm text-slate-600">
            Input konsumsi bulanan, lihat tren, dan dapatkan rekomendasi hemat energi dari AI.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <MapPin className="mb-2 h-5 w-5 text-emerald-600" aria-hidden="true" />
          <div className="text-sm font-medium text-slate-900">Lapor Masalah Kota</div>
          <p className="text-sm text-slate-600">
            Laporkan jalan rusak, sampah, dan masalah lain lengkap dengan foto dan lokasi.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <ShieldCheck className="mb-2 h-5 w-5 text-emerald-600" aria-hidden="true" />
          <div className="text-sm font-medium text-slate-900">Transparan</div>
          <p className="text-sm text-slate-600">
            Setiap perubahan status tercatat dan bisa dilacak dari laporan hingga selesai.
          </p>
        </div>
      </div>
    </main>
  );
}
