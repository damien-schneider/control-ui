"use client";

import { CodeIcon, Heading1Icon, ListIcon, QuoteIcon } from "lucide-react";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandItemContent,
  CommandItemDescription,
  CommandItemTitle,
  CommandList,
} from "@/components/control-ui/ui/command";

const blocks = [
  { value: "heading", title: "Heading 1", description: "Big section heading", Icon: Heading1Icon },
  { value: "bullet-list", title: "Bullet list", description: "Create a simple bulleted list", Icon: ListIcon },
  { value: "quote", title: "Quote", description: "Capture a quotation", Icon: QuoteIcon },
  { value: "code", title: "Code block", description: "Capture a code snippet with syntax highlighting", Icon: CodeIcon },
];

export function PrimitiveCommandDescriptionsExample() {
  return (
    <div className="w-full max-w-72">
      <Command label="Insert block">
        <CommandList>
          <CommandGroup heading="Basic blocks">
            {blocks.map(({ value, title, description, Icon }) => (
              <CommandItem key={value} value={value} keywords={[title, description]}>
                <Icon aria-hidden="true" />
                <CommandItemContent>
                  <CommandItemTitle>{title}</CommandItemTitle>
                  <CommandItemDescription>{description}</CommandItemDescription>
                </CommandItemContent>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
