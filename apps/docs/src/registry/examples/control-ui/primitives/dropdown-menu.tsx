"use client";

import { ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/control-ui/ui/dropdown-menu";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset aria-label={label} className="flex min-w-0 flex-col gap-2">
      <span className="text-caption font-medium text-muted-foreground">{label}</span>
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
      <DropdownMenuChoicesExample />
      <span className="text-caption text-muted-foreground">{last ? `Last action: ${last}` : "No action yet"}</span>
    </div>
  );
}

function DropdownMenuChoicesExample() {
  const [notifications, setNotifications] = useState(true);
  const [visibility, setVisibility] = useState("team");
  const [shared, setShared] = useState(false);

  return (
    <Row label="Workspace options">
      <DropdownMenu>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" sideOffset={8}>
          <DropdownMenuGroup aria-label="Preferences">
            <DropdownMenuCheckboxItem checked={notifications} onCheckedChange={setNotifications} closeOnClick={false}>
              Notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem disabled>Organization policy</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value={visibility} onValueChange={setVisibility} aria-label="Visibility">
              <DropdownMenuRadioItem value="team">Team only</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="everyone">Everyone</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<a href="#workspace-settings" />} nativeButton={false}>
            Settings<DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setShared(true)}>Copy workspace link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <span role="status">
        {shared ? "Last action: Copy workspace link" : `${notifications ? "Notifications on" : "Notifications off"}, ${visibility}`}
      </span>
    </Row>
  );
}
