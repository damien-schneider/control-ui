"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/control-ui/ui/select";
import { Text } from "@/components/control-ui/ui/typography";

const MODELS = [
  { value: "opus", label: "Claude Opus 4.8" },
  { value: "sonnet", label: "Claude Sonnet 4.6" },
  { value: "haiku", label: "Claude Haiku 4.5" },
];

const REGION_GROUPS = [
  {
    label: "Europe",
    regions: [
      { value: "fra1", label: "Frankfurt" },
      { value: "cdg1", label: "Paris" },
    ],
  },
  {
    label: "North America",
    regions: [
      { value: "iad1", label: "Washington, D.C." },
      { value: "sfo1", label: "San Francisco" },
    ],
  },
];

const AUTOMATIC_REGION = { value: "auto", label: "Closest to visitor" };
const REGIONS = [...REGION_GROUPS.flatMap((group) => group.regions), AUTOMATIC_REGION];

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Text size="caption" weight="medium" tone="muted">
        {label}
      </Text>
      {children}
    </div>
  );
}

export function PrimitiveSelectExample() {
  const [model, setModel] = useState("opus");
  const [region, setRegion] = useState("fra1");
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
      <Row label="Groups, labels, and a separator">
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-full" aria-label="Deployment region">
            <SelectValue>{(value: string) => REGIONS.find((entry) => entry.value === value)?.label ?? "Select…"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {REGION_GROUPS.map((group) => (
              <SelectGroup key={group.label}>
                <SelectGroupLabel>{group.label}</SelectGroupLabel>
                {group.regions.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
            <SelectSeparator />
            <SelectItem value={AUTOMATIC_REGION.value}>{AUTOMATIC_REGION.label}</SelectItem>
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
