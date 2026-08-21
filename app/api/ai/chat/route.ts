import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { askEcoBot, getQuerySuggestions } from "@/lib/rag/engine";

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = getQuerySuggestions(q, 5);
  return NextResponse.json({ suggestions });
});

export const POST = withErrorHandling(async (req: Request) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(`ai-chat:${session.userId}`, 15, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak pesan. Mohon tunggu beberapa detik." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const query = typeof body.message === "string" ? body.message : "";

  if (!query.trim()) {
    return NextResponse.json(
      { error: "Pesan tidak boleh kosong." },
      { status: 400 },
    );
  }

  const response = await askEcoBot(query);
  return NextResponse.json(response);
});
