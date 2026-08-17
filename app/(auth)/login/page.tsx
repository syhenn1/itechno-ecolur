import { Suspense } from "react";
import { Leaf } from "lucide-react";
import { OtpForm } from "@/components/auth/otp-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Leaf className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-slate-900">Masuk ke EcoLur</h1>
        <p className="text-sm text-slate-600">Gunakan nomor HP Anda — tanpa password, verifikasi lewat kode OTP.</p>
      </div>
      <Suspense>
        <OtpForm />
      </Suspense>
    </div>
  );
}
