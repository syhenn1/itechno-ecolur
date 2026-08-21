import { Suspense } from "react";
import { OtpForm } from "@/components/auth/otp-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/Lambang_Kabupaten_Bogor.svg.webp"
          alt="Lambang Kabupaten Bogor"
          className="h-14 w-14 object-contain drop-shadow-sm mb-1"
        />
        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
          Pemerintah Kabupaten Bogor
        </div>
        <h1 className="text-xl font-bold text-slate-900">Masuk ke EcoLur</h1>
        <p className="text-xs text-slate-600">
          Gunakan nomor HP Anda — tanpa password, verifikasi instan lewat kode OTP.
        </p>
      </div>
      <Suspense>
        <OtpForm />
      </Suspense>
    </div>
  );
}
