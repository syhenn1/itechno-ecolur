import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Marks a prize as physically handed over. The app tracks eligibility and redemption — it
// can't dispense the prize itself, so this is deliberately a manual action by staff, not
// something that fires automatically when a citizen reaches the level.
export const POST = withErrorHandling(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getSession();
  if (!session || (session.role !== "OFFICER" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const claim = await prisma.prizeClaim.findUnique({ where: { id } });
  if (!claim) return NextResponse.json({ error: "Klaim tidak ditemukan" }, { status: 404 });
  if (claim.claimedAt) return NextResponse.json({ error: "Sudah ditandai diberikan sebelumnya" }, { status: 400 });

  const updated = await prisma.prizeClaim.update({ where: { id }, data: { claimedAt: new Date() } });
  return NextResponse.json({ claim: updated });
});
