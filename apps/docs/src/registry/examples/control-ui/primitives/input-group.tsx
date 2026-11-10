"use client";

import { SearchIcon } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/control-ui/ui/field";
import { Input } from "@/components/control-ui/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/control-ui/ui/input-group";
import { Kbd } from "@/components/control-ui/ui/kbd";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveInputGroupExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Field>
        <FieldLabel>URL</FieldLabel>
        <InputGroup>
          <InputGroupAddon>/dashboard/</InputGroupAddon>
          <Input defaultValue="reflet" />
        </InputGroup>
        <FieldDescription>Lowercase letters, numbers, and hyphens</FieldDescription>
      </Field>
      <div className="flex flex-col gap-2">
        <Text size="caption" weight="medium" tone="muted">
          Addon + field
        </Text>
        <InputGroup size="sm">
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <Input type="search" aria-label="Search documentation" placeholder="Search documentation…" />
          <InputGroupAddon>
            <Kbd>⌘K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-2">
        <Text size="caption" weight="medium" tone="muted">
          Render prop — the group renders as a button
        </Text>
        <InputGroup render={<button type="button" aria-label="Search documentation" />} size="sm">
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <span className="min-w-0 flex-1 truncate">Search documentation...</span>
          <Kbd>⌘K</Kbd>
        </InputGroup>
      </div>
    </div>
  );
}
