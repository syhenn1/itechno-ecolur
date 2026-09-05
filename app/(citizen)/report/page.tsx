import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusTimeline } from "@/components/reports/status-timeline";
import { ReportForm } from "@/components/reports/report-form";
import { PlusCircle, ListFilter, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export default async function ReportPage() {
  const session = await getSession();
  if (!session) return null;

  const myReports = await prisma.report.findMany({
    where: { userId: session.userId },
    include: { statusLogs: { orderBy: { updatedAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Lapor masalah dan pantau riwayat</h1>
        <p className="text-sm text-slate-600 mt-1">
          Kirim laporan kerusakan fasilitas publik di sekitar Bojong Kulur dan pantau status perbaikannya.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                Buat laporan baru (+35 XP)
              </CardTitle>
            </CardHeader>
            <div className="pt-4">
              <ReportForm />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-emerald-600" />
                Laporan saya ({myReports.length})
              </CardTitle>
            </CardHeader>

            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {myReports.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                  <Clock className="h-8 w-8 text-slate-300 mx-auto" />
                  <p>Anda belum memiliki laporan yang terkirim.</p>
                  <p className="text-[11px] text-slate-400">Gunakan form di sebelah kiri untuk melaporkan masalah jalan rusak, sampah, atau drainase.</p>
                </div>
              ) : (
                myReports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-4 space-y-3 transition-colors hover:border-emerald-300 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold capitalize text-slate-900">
                          {report.category.replace(/_/g, " ")}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {new Date(report.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-md border border-slate-100">
                      {report.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100">
                      <StatusTimeline logs={report.statusLogs} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* SOP Service Box */}
          <div className="rounded-md border border-slate-200 bg-white p-5 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              <span>Proses penanganan laporan</span>
            </div>
            <ul className="space-y-2 text-slate-600 text-[11px] leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Verifikasi petugas:</strong> laporan diverifikasi dalam 1x24 jam kerja.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Prioritas penanganan:</strong> diurutkan berdasarkan tingkat keparahan dan jarak terdekat.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Bonus XP:</strong> saat laporan selesai ditangani, Anda mendapat 25 XP tambahan.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
