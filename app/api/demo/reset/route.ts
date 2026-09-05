import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { seedDemoData } from "@/prisma/seed-logic";

// EcoLur is a competition demo: every screen (XP, badges, energy logs, reports, prize claims)
// is fully interactive and writes to the real database so judges can try it end to end. This
// route is the escape hatch for that — it re-runs the exact same seeding routine used to set
// up the database in the first place (see prisma/seed-logic.ts), which wipes and re-inserts
// every demo table back to its original baseline. Anyone logged in (citizen/officer/admin, all
// of them demo accounts) can trigger it — there's no separate real user population to protect.
export const POST = withErrorHandling(async () => {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!checkRateLimit("demo-reset", 1, 15_000)) {
    return NextResponse.json({ error: "Reset baru saja dijalankan. Tunggu beberapa detik lagi." }, { status: 429 });
  }

  const result = await seedDemoData(prisma);
  return NextResponse.json({ ok: true, result });
});
