import { EcoBotChat } from "@/components/ai/eco-bot-chat";
import { getSession } from "@/lib/auth";
import { BookOpen, ShieldCheck, Zap, HelpCircle } from "lucide-react";

export default async function AskAiPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tanya EcoBot</h1>
        <p className="text-sm text-slate-600 mt-1">
          Tanyakan tarif listrik PLN, panduan panel surya, efisiensi energi, atau prosedur pelaporan warga.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8">
          <EcoBotChat />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-md border border-slate-200 bg-white p-5 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span>Sumber jawaban</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              EcoBot merujuk langsung ke dokumen resmi berikut:
            </p>
            <ul className="space-y-2 text-slate-700 font-medium pt-1">
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                <Zap className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                <span><strong>Permen ESDM No. 2/2024:</strong> regulasi dan kuota PLTS atap terhubung PLN.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                <span><strong>Tarif penyesuaian PLN:</strong> perhitungan R-1/TR 900-5500 VA.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-600 mt-0.5 shrink-0" />
                <span><strong>SOP Desa Jatikulur:</strong> alur penanganan jalan rusak dan sampah.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span>Contoh pertanyaan</span>
            </div>
            <div className="space-y-1.5 text-slate-600">
              <div className="bg-slate-50 p-2 rounded-md border border-slate-200 italic">
                &ldquo;Berapa biaya dan kapasitas panel surya untuk rumah 2200 VA?&rdquo;
              </div>
              <div className="bg-slate-50 p-2 rounded-md border border-slate-200 italic">
                &ldquo;Apakah ada denda jika tidak memakai token listrik prabayar?&rdquo;
              </div>
              <div className="bg-slate-50 p-2 rounded-md border border-slate-200 italic">
                &ldquo;Bagaimana standar waktu perbaikan jalan rusak di Jatikulur?&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
