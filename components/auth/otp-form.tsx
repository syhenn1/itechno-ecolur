"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { showGamificationToasts } from "@/lib/gamification-client";
import { Smartphone, Sparkles, ArrowRight, KeyRound, User, Wrench, Building2 } from "lucide-react";

type Step = "phone" | "otp";

const DEMO_ACCOUNTS = [
  { label: "Warga Demo", phone: "081234567890", role: "Warga", iconType: "user" },
  { label: "Petugas Demo", phone: "081234567891", role: "Petugas", iconType: "wrench" },
  { label: "Admin Demo", phone: "081234567892", role: "Admin", iconType: "admin" },
];

function renderDemoIcon(type: string) {
  switch (type) {
    case "user":
      return <User className="h-5 w-5 text-emerald-700 mb-0.5" />;
    case "wrench":
      return <Wrench className="h-5 w-5 text-amber-700 mb-0.5" />;
    case "admin":
      return <Building2 className="h-5 w-5 text-sky-800 mb-0.5" />;
    default:
      return <User className="h-5 w-5 text-emerald-700 mb-0.5" />;
  }
}

export function OtpForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtpForPhone(targetPhone: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "request", phone: targetPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim OTP");
      setChallengeToken(data.challengeToken);
      setDevCode(data.devCode ?? null);
      if (data.devCode) {
        setCode(data.devCode); // Auto-fill dev code for frictionless demo
      }
      setStep("otp");
      toast.success("Kode OTP terkirim!", {
        description: data.devCode ? `Kode OTP demo: ${data.devCode}` : "Cek WhatsApp/SMS Anda.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestOtp(event: FormEvent) {
    event.preventDefault();
    await requestOtpForPhone(phone);
  }

  const handleQuickDemoSelect = (demoPhone: string) => {
    setPhone(demoPhone);
    requestOtpForPhone(demoPhone);
  };

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "verify", phone, code, challengeToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kode OTP salah atau kedaluwarsa");
      toast.success("Berhasil masuk!");
      showGamificationToasts(data.gamification);

      const roleHome = data.role === "ADMIN" 
        ? "/dashboard" 
        : data.role === "OFFICER" 
          ? "/incoming-reports" 
          : "/energy";
      const targetUrl = next && next !== "/" && next !== "/login" ? next : roleHome;
      window.location.href = targetUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in-up">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
            <KeyRound className="h-4 w-4 text-emerald-600" />
            <span>Verifikasi Nomor: {phone}</span>
          </div>
          {devCode && (
            <p className="mt-1 text-[11px] font-mono text-emerald-800 bg-emerald-100/80 py-1 px-2 rounded-lg inline-block">
              Kode OTP Dev: <strong>{devCode}</strong>
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="code">Masukkan 6 Digit Kode OTP</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            required
            autoFocus
            className="text-center font-mono text-lg tracking-widest border-emerald-300 focus:border-emerald-500 rounded-xl"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime text-white font-bold py-3 shadow-md eco-glow-leaf transition-all hover:opacity-95 active:scale-95"
          loading={loading}
          disabled={code.length !== 6}
        >
          <span>Verifikasi &amp; Masuk</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>

        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setCode("");
          }}
          className="w-full text-center text-xs font-semibold text-slate-500 transition-all hover:text-emerald-700 active:scale-95 py-1"
        >
          &larr; Ganti Nomor HP
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      <form onSubmit={handleRequestOtp} className="space-y-4">
        <div>
          <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
            <span>Nomor Handphone (WhatsApp)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 081234567890"
            required
            autoFocus
            className="mt-1.5 rounded-xl border-slate-300 focus:border-emerald-500 text-sm font-medium"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Cukup masukkan nomor HP. Jika nomor baru, akun otomatis dibuat tanpa perlu kata sandi.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime text-white font-bold py-3 shadow-md eco-glow-leaf transition-all hover:opacity-95 active:scale-95"
          loading={loading}
          disabled={!phone}
        >
          <span>Kirim Kode OTP</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </form>

      {/* Quick Demo 1-Click Login Chips */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Demo 1-Click Login:
          </span>
          <span className="text-[10px] text-slate-400">Pilih akun demo</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((demo) => (
            <button
              key={demo.phone}
              type="button"
              onClick={() => handleQuickDemoSelect(demo.phone)}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-xs transition-all active:scale-95 disabled:opacity-50 text-center"
            >
              {renderDemoIcon(demo.iconType)}
              <span className="text-xs font-extrabold text-slate-800 leading-tight">{demo.label}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">{demo.role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
