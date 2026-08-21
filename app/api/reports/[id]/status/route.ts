import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getSession, getOfficerProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { reportStatusUpdateSchema } from "@/lib/validations";
import { awardXp } from "@/lib/gamification";

export const POST = withErrorHandling(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getSession();
  if (!session || (session.role !== "OFFICER" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = reportStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });

  const officer = session.role === "OFFICER" ? await getOfficerProfile(session.userId) : null;
  const { status, notes } = parsed.data;

  // Append-only: INSERT a new ReportStatusLog row, never UPDATE an old one (see CLAUDE.md).
  // Report.status is kept in sync in the same transaction so list views don't need to
  // join+aggregate the log on every read.
  const [, updatedReport] = await prisma.$transaction([
    prisma.reportStatusLog.create({
      data: { reportId: id, officerId: officer?.id, status, notes },
    }),
    prisma.report.update({ where: { id }, data: { status } }),
  ]);

  // Awarded to the citizen who filed the report, not the officer making this request — there's
  // no live notification channel to them yet, they'll see it next time they open the app.
  if (status === "RESOLVED") {
    await awardXp(report.userId, "report_resolved");
  }

  return NextResponse.json({ report: updatedReport });
});
