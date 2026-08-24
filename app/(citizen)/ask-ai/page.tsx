import { EcoBotChat } from "@/components/ai/eco-bot-chat";
import { getSession } from "@/lib/auth";
import { Sparkles, BookOpen, ShieldCheck, Zap, HelpCircle } from "lucide-react";

export default async function AskAiPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-0.5 text-xs font-bold text-emerald-800 mb-2 border border-emerald-200">
          <Sparkles className="h-3.5 w-3.5" /> Asisten Cerdas RAG &middot; Regulasi &amp; Efisiensi
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tanya EcoBot (AI Asisten Warga)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Konsultasi regulasi kelistrikan PLN, panduan teknis PLTS atap ESDM, efisiensi energi rumah tangga, dan SOP pelayanan publik Bojong Kulur.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        {/* Main Chat Area (8 cols) */}
        <div className="lg:col-span-8">
          <EcoBotChat />
        </div>

        {/* Knowledge Base & FAQ Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
              <BookOpen className="h-4 w-4 text-emerald-700" />
              <span>Basis Pengetahuan Resmi (RAG)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              EcoBot didukung oleh mesin pencari semantik lokal yang merujuk langsung ke dokumen resmi:
            </p>
            <ul className="space-y-2 text-slate-700 font-medium pt-1">
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Zap className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                <span><strong>Permen ESDM No. 2/2024:</strong> Regulasi &amp; Kuota PLTS Atap Terhubung PLN.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Tarif Penyesuaian PLN:</strong> Perhitungan R-1/TR 900–5500 VA.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-600 mt-0.5 shrink-0" />
                <span><strong>SOP Desa Bojong Kulur:</strong> Alur penanganan jalan rusak &amp; sampah.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-5 shadow-xs text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
              <HelpCircle className="h-4 w-4 text-emerald-700" />
              <span>Contoh Pertanyaan</span>
            </div>
            <div className="space-y-1.5 text-slate-600">
              <div className="bg-white p-2 rounded-xl border border-emerald-100/80 italic">
                &ldquo;Berapa biaya dan kapasitas panel surya untuk rumah 2200 VA?&rdquo;
              </div>
              <div className="bg-white p-2 rounded-xl border border-emerald-100/80 italic">
                &ldquo;Apakah ada denda jika tidak memakai token listrik prabayar?&rdquo;
              </div>
              <div className="bg-white p-2 rounded-xl border border-emerald-100/80 italic">
                &ldquo;Bagaimana standar waktu perbaikan jalan rusak di Bojong Kulur?&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
