"use client";

import { ChevronRightIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/control-ui/ui/command";

export function PrimitiveCommandExample() {
  return (
    <div className="w-full max-w-sm">
      <Command className="ring-1 ring-inset ring-border shadow-pop">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem value="new-thread">
              New thread
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem value="search-docs">Search docs</CommandItem>
            <CommandItem value="invite">Invite teammate</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Pages">
            <CommandItem value="settings profile">
              <span className="text-muted-foreground">Settings</span>
              <ChevronRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span>Profile</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
            <CommandItem value="settings workspace members">
              <span className="text-muted-foreground">Settings</span>
              <ChevronRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span className="text-muted-foreground">Workspace</span>
              <ChevronRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span>Members</span>
            </CommandItem>
            <CommandItem value="settings billing invoices">
              <span className="text-muted-foreground">Settings</span>
              <ChevronRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span className="text-muted-foreground">Billing</span>
              <ChevronRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span>Invoices</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
