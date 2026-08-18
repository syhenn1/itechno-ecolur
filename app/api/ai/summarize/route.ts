import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getReportSummary } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export const POST = withErrorHandling(async (request: Request) => {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(`ai-summarize:${session.userId}`, 10, 60_000)) {
    return NextResponse.json({ error: "Terlalu sering. Coba lagi sebentar lagi." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const category = typeof body?.category === "string" ? body.category : undefined;

  const reports = await prisma.report.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const summary = await getReportSummary(reports);
  return NextResponse.json({ summary });
});
