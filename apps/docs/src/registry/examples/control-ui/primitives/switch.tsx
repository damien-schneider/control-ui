"use client";

import { CheckIcon, MoonIcon, SunIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Switch } from "@/components/control-ui/ui/switch";

function Row({ htmlFor, label, children }: { htmlFor: string; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[13px] font-medium text-foreground">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export function PrimitiveSwitchExample() {
  const [wifi, setWifi] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [theme, setTheme] = useState(true);
  const [confirm, setConfirm] = useState(true);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Row htmlFor="sw-wifi" label="Wi-Fi">
        <Switch id="sw-wifi" checked={wifi} onCheckedChange={setWifi} aria-label="Wi-Fi" />
      </Row>
      <Row htmlFor="sw-analytics" label="Share analytics">
        <Switch id="sw-analytics" checked={analytics} onCheckedChange={setAnalytics} aria-label="Share analytics" />
      </Row>
      <Row htmlFor="sw-theme" label="Dark mode (state icons)">
        <Switch
          id="sw-theme"
          checked={theme}
          onCheckedChange={setTheme}
          aria-label="Dark mode"
          checkedIcon={<MoonIcon />}
          uncheckedIcon={<SunIcon />}
        />
      </Row>
      <Row htmlFor="sw-confirm" label="Confirmed (single icon)">
        <Switch
          id="sw-confirm"
          checked={confirm}
          onCheckedChange={setConfirm}
          aria-label="Confirmed"
          icon={confirm ? <CheckIcon /> : <XIcon />}
        />
      </Row>
      <Row htmlFor="sw-on" label="On, disabled">
        <Switch id="sw-on" checked disabled aria-label="On, disabled" />
      </Row>
      <Row htmlFor="sw-off" label="Off, disabled">
        <Switch id="sw-off" disabled aria-label="Off, disabled" />
      </Row>
    </div>
  );
}
