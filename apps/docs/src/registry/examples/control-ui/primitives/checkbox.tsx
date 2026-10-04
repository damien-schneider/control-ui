"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Checkbox } from "@/components/control-ui/ui/checkbox";
import { Text } from "@/components/control-ui/ui/typography";

function Row({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <Text as="div" weight="medium" tone="foreground" className="flex items-center gap-2.5">
      {children}
      <label htmlFor={id}>{label}</label>
    </Text>
  );
}

export function PrimitiveCheckboxExample() {
  const [newsletter, setNewsletter] = useState(true);
  const [parent, setParent] = useState<boolean | "indeterminate">("indeterminate");

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Row id="cb-news" label="Email me product news">
        <Checkbox id="cb-news" checked={newsletter} onCheckedChange={setNewsletter} aria-label="Email me product news" />
      </Row>
      <Row id="cb-mixed" label="Select all channels">
        <Checkbox
          id="cb-mixed"
          checked={parent === true}
          indeterminate={parent === "indeterminate"}
          onCheckedChange={(checked) => setParent(checked)}
          aria-label="Select all channels"
        />
      </Row>
      <Row id="cb-on" label="Checked, disabled">
        <Checkbox id="cb-on" checked disabled aria-label="Checked, disabled" />
      </Row>
      <Row id="cb-off" label="Off, disabled">
        <Checkbox id="cb-off" disabled aria-label="Off, disabled" />
      </Row>
    </div>
  );
}
