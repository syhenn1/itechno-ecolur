import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEnergyRecommendation } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export const POST = withErrorHandling(async () => {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit(`ai-recommend:${session.userId}`, 5, 60_000)) {
    return NextResponse.json({ error: "Terlalu sering. Coba lagi sebentar lagi." }, { status: 429 });
  }

  const logs = await prisma.energyLog.findMany({
    where: { userId: session.userId },
    orderBy: { period: "desc" },
    take: 12,
  });

  const recommendation = await getEnergyRecommendation(logs.reverse());
  return NextResponse.json({ recommendation });
});
