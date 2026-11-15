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
import { Kbd, KbdGroup } from "@/components/control-ui/ui/kbd";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveCommandExample() {
  return (
    <div className="w-full max-w-sm">
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty />
          <CommandGroup heading="Suggestions">
            <CommandItem value="new-thread">
              New thread
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>N</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem value="search-docs">Search docs</CommandItem>
            <CommandItem value="invite">Invite teammate</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Pages">
            <CommandItem value="settings profile">
              <Text tone="muted">Settings</Text>
              <ChevronRightIcon aria-hidden="true" />
              <span>Profile</span>
              <CommandShortcut>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>,</Kbd>
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
            <CommandItem value="settings workspace members">
              <Text tone="muted">Settings</Text>
              <ChevronRightIcon aria-hidden="true" />
              <Text tone="muted">Workspace</Text>
              <ChevronRightIcon aria-hidden="true" />
              <span>Members</span>
            </CommandItem>
            <CommandItem value="settings billing invoices">
              <Text tone="muted">Settings</Text>
              <ChevronRightIcon aria-hidden="true" />
              <Text tone="muted">Billing</Text>
              <ChevronRightIcon aria-hidden="true" />
              <span>Invoices</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
