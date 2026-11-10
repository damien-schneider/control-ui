"use client";

import { useState } from "react";
import { InputOTP } from "@/components/control-ui/ui/input-otp";
import { Label } from "@/components/control-ui/ui/label";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveInputOtpExample() {
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="otp-verify">Verification code</Label>
        <InputOTP
          id="otp-verify"
          length={6}
          value={code}
          onValueChange={(nextCode) => {
            setCode(nextCode);
            setSubmittedCode(null);
          }}
          onValueComplete={setSubmittedCode}
          aria-label="Verification code"
        />
        <Text size="caption" tone="muted" role="status">
          {submittedCode ? `Verifying ${submittedCode}…` : `Enter the 6-digit code (${code.length}/6)`}
        </Text>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="otp-pin">PIN with separator</Label>
        <InputOTP id="otp-pin" length={6} separator value={pin} onValueChange={setPin} aria-label="PIN" />
      </div>
    </div>
  );
}
