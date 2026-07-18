"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/control-ui/ui/menu";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function PrimitiveMenuExample() {
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Row label="Dropdown menu">
        <Menu>
          <MenuTrigger>Actions</MenuTrigger>
          <MenuContent>
            <MenuLabel>Document</MenuLabel>
            <MenuItem onClick={() => setLast("Rename")}>Rename</MenuItem>
            <MenuItem onClick={() => setLast("Duplicate")}>Duplicate</MenuItem>
            <MenuSeparator />
            <MenuItem onClick={() => setLast("Delete")}>Delete</MenuItem>
          </MenuContent>
        </Menu>
      </Row>
      <span className="text-[11px] text-muted-foreground">{last ? `Last action: ${last}` : "No action yet"}</span>
    </div>
  );
}
