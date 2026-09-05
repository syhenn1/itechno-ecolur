"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { showGamificationToasts } from "@/lib/gamification-client";
import { useTutorial } from "@/components/tutorial/tutorial-provider";

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function EnergyForm() {
  const router = useRouter();
  const tutorial = useTutorial();
  const [period, setPeriod] = useState(currentPeriod());
  const [consumptionKwh, setConsumptionKwh] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!period) {
      toast.error("Pilih periode bulannya dulu, ya.");
      return;
    }
    if (!consumptionKwh || Number(consumptionKwh) <= 0) {
      toast.error("Isi jumlah kWh yang valid dulu, ya.");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const origin = { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight };
    setLoading(true);
    try {
      const res = await fetch("/api/energy-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, consumptionKwh: Number(consumptionKwh) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan data");
      setConsumptionKwh("");

      if (data.isUpdate) {
        // Editing a month already logged before — no XP/celebration on purpose (otherwise
        // resubmitting the same period over and over would be free, unlimited XP), so say that
        // plainly instead of just silently skipping the usual explosion + "+XX EXP" popup.
        toast.info(`Konsumsi periode ${period} diperbarui`, {
          description: "XP hanya diberikan untuk pencatatan bulan yang belum pernah diisi.",
        });
      } else {
        toast.success(`Konsumsi periode ${period} tersimpan`);
        showGamificationToasts(data.gamification, origin);
        tutorial?.complete("energy_log");
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-tutorial-zone="energy_log"
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Label htmlFor="period">Periode</Label>
        <Input id="period" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </div>
      <div className="flex-1">
        <Label htmlFor="consumptionKwh">Konsumsi (kWh)</Label>
        <Input
          id="consumptionKwh"
          type="number"
          inputMode="decimal"
          step="0.1"
          value={consumptionKwh}
          onChange={(e) => setConsumptionKwh(e.target.value)}
          placeholder="mis. 150"
        />
      </div>
      <Button type="submit" loading={loading} disabled={!consumptionKwh}>
        Simpan
      </Button>
    </form>
  );
}
