import { EcoBotChat } from "@/components/ai/eco-bot-chat";
import { getSession } from "@/lib/auth";

export default async function AskAiPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold text-slate-900">Tanya EcoBot</h1>
        <p className="text-sm text-slate-600">
          Konsultasi regulasi kelistrikan, panduan PLTS atap, efisiensi energi, dan SOP layanan publik.
        </p>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <EcoBotChat />
      </div>
    </div>
  );
}
