"use client";

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
          <CommandGroup heading="Settings">
            <CommandItem value="profile">
              Profile
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
            <CommandItem value="billing">Billing</CommandItem>
            <CommandItem value="disabled" disabled>
              Coming soon
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
