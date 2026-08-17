import { Card } from "@/components/ui/card";
import { ReportForm } from "@/components/reports/report-form";

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Lapor Masalah</h1>
        <p className="text-sm text-slate-600">
          Laporkan masalah infrastruktur di sekitar Anda — jalan rusak, sampah, dan lainnya.
        </p>
      </div>
      <Card>
        <ReportForm />
      </Card>
    </div>
  );
}
