"use client";

import { ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/control-ui/ui/dropdown-menu";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset aria-label={label} className="flex min-w-0 flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </fieldset>
  );
}

export function PrimitiveDropdownMenuExample() {
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Row label="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Document</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setLast("Rename")}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLast("Duplicate")}>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLast("Delete")}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Row>
      <Row label="Full-width trigger">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full justify-between" size="md">
            <span className="min-w-0 flex-1 truncate text-left">Acme</span>
            <ChevronsUpDown aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Workspace settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Row>
      <Row label="Composed trigger">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full justify-between" size="md" variant="ghost" render={<Button />}>
            <span className="min-w-0 flex-1 truncate text-left">
              Acme design and engineering workspace for all international product teams and external collaborators
            </span>
            <ChevronsUpDown aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Workspace settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-xs text-muted-foreground">
          The trigger already owns button styling. Set size and variant on DropdownMenuTrigger, including when composing with render.
        </p>
      </Row>
      <span className="text-[11px] text-muted-foreground">{last ? `Last action: ${last}` : "No action yet"}</span>
    </div>
  );
}
