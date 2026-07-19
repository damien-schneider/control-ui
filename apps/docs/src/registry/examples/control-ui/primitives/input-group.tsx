"use client";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/control-ui/ui/input-group";
import { Kbd } from "@/components/control-ui/ui/kbd";

export function PrimitiveInputGroupExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium text-muted-foreground">Addon + field</span>
        <InputGroup size="sm">
          <InputGroupAddon>
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none">
              <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.3" />
              <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </InputGroupAddon>
          <InputGroupInput placeholder="Search documentation..." />
          <InputGroupAddon>
            <Kbd>⌘K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium text-muted-foreground">Render prop — the group renders as a button</span>
        <InputGroup
          render={<button type="button" aria-label="Search documentation" />}
          size="sm"
          className="cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <InputGroupAddon>
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none">
              <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.3" />
              <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </InputGroupAddon>
          <span className="min-w-0 flex-1 truncate text-left">Search documentation...</span>
          <Kbd>⌘K</Kbd>
        </InputGroup>
      </div>
    </div>
  );
}
