"use client";

import { useState } from "react";

import { InputOTP } from "@/components/control-ui/ui/input-otp";

export function PrimitiveInputOtpExample() {
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="otp-verify" className="text-[11px] font-medium text-muted-foreground">
          Verification code
        </label>
        <InputOTP id="otp-verify" length={6} value={code} onValueChange={setCode} aria-label="Verification code" />
        <span className="text-[11px] text-muted-foreground">
          {code.length === 6 ? "Code complete — verifying…" : `Enter the 6-digit code (${code.length}/6)`}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="otp-pin" className="text-[11px] font-medium text-muted-foreground">
          PIN with separator
        </label>
        <InputOTP id="otp-pin" length={6} separator value={pin} onValueChange={setPin} aria-label="PIN" />
      </div>
    </div>
  );
}
