"use client";

import { useState } from "react";

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/control-ui/ui/combobox";

interface Framework {
  value: string;
  label: string;
}

const FRAMEWORKS: Framework[] = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "solidstart", label: "SolidStart" },
  { value: "tanstack", label: "TanStack Start" },
  { value: "gatsby", label: "Gatsby" },
];

export function PrimitiveComboboxExample() {
  const [framework, setFramework] = useState<Framework | null>(FRAMEWORKS[0] ?? null);

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">Framework</span>
      <Combobox items={FRAMEWORKS} value={framework} onValueChange={setFramework}>
        <ComboboxInput placeholder="Search framework…" aria-label="Framework" />
        <ComboboxContent>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList>
            {(item: Framework) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <span className="text-[11px] text-muted-foreground">{framework ? `Selected: ${framework.label}` : "Nothing selected"}</span>
    </div>
  );
}
