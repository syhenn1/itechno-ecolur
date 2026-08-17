"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function EnergyForm() {
  const router = useRouter();
  const [period, setPeriod] = useState(currentPeriod());
  const [consumptionKwh, setConsumptionKwh] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="period">Periode</Label>
        <Input id="period" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} required />
      </div>
      <div className="flex-1">
        <Label htmlFor="consumptionKwh">Konsumsi (kWh)</Label>
        <Input
          id="consumptionKwh"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          value={consumptionKwh}
          onChange={(e) => setConsumptionKwh(e.target.value)}
          placeholder="mis. 150"
          required
        />
      </div>
      <Button type="submit" disabled={loading || !consumptionKwh}>
        {loading ? "Menyimpan..." : "Simpan"}
      </Button>
      {error && <p className="text-sm text-red-600 sm:basis-full">{error}</p>}
    </form>
  );
}
