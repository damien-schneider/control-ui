"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

const MODELS = [
  { value: "opus", label: "Claude Opus 4.8" },
  { value: "sonnet", label: "Claude Sonnet 4.6" },
  { value: "haiku", label: "Claude Haiku 4.5" },
];

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function PrimitiveSelectExample() {
  const [model, setModel] = useState("opus");
  const labelFor = (value: string) => MODELS.find((m) => m.value === value)?.label ?? "Select…";

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Row label="Default">
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-full" aria-label="Model">
            <SelectValue>{(value: string) => labelFor(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
      <Row label="Disabled">
        <Select value="opus" disabled>
          <SelectTrigger className="w-full" aria-label="Disabled select">
            <SelectValue>{(value: string) => labelFor(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>
    </div>
  );
}
