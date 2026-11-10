"use client";

import { UserIcon } from "lucide-react";
import { useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
} from "@/components/control-ui/ui/combobox";
import { InputGroupAddon } from "@/components/control-ui/ui/input-group";

const TEAMMATES = ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Katherine Johnson", "Linus Torvalds", "Margaret Hamilton"];

export function PrimitiveComboboxInputGroupExample() {
  const [assignee, setAssignee] = useState<string | null>("Grace Hopper");

  return (
    <div className="w-full max-w-sm">
      <Combobox items={TEAMMATES} value={assignee} onValueChange={setAssignee}>
        <ComboboxInputGroup>
          <InputGroupAddon>
            <UserIcon aria-hidden="true" />
          </InputGroupAddon>
          <ComboboxInput placeholder="Search teammates…" aria-label="Assignee" />
        </ComboboxInputGroup>
        <ComboboxContent>
          <ComboboxEmpty>No teammate found.</ComboboxEmpty>
          <ComboboxList>
            {(teammate: string) => (
              <ComboboxItem key={teammate} value={teammate}>
                {teammate}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
