"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { statusLabel } from "@/lib/utils";
import { useTutorial } from "@/components/tutorial/tutorial-provider";

const NEXT_STATUS: Record<string, { value: string; label: string }[]> = {
  REPORTED: [{ value: "VERIFIED", label: "Verifikasi" }],
  VERIFIED: [{ value: "IN_PROGRESS", label: "Proses" }],
  IN_PROGRESS: [{ value: "RESOLVED", label: "Selesaikan" }],
  RESOLVED: [],
};

export function StatusUpdateForm({ reportId, currentStatus }: { reportId: string; currentStatus: string }) {
  const router = useRouter();
  const tutorial = useTutorial();
  const [notes, setNotes] = useState("");
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const options = NEXT_STATUS[currentStatus] ?? [];
  if (options.length === 0) return null;

  async function handleUpdate(status: string) {
    setPendingStatus(status);
    try {
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memperbarui status");
      setNotes("");
      toast.success(`Status diubah ke "${statusLabel(status)}"`);
      tutorial?.complete("officer_update_status");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div data-tutorial-zone="officer_update_status" className="mt-4 space-y-2 border-t border-slate-100 pt-4">
      <Textarea
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Catatan tindak lanjut (opsional)"
      />
      <div className="flex gap-2">
        {options.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            size="sm"
            loading={pendingStatus === opt.value}
            disabled={pendingStatus !== null && pendingStatus !== opt.value}
            onClick={() => handleUpdate(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
