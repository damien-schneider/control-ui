"use client";

import { SearchIcon } from "lucide-react";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/control-ui/ui/autocomplete";
import { InputGroupAddon } from "@/components/control-ui/ui/input-group";

const PAGES = ["Accordion", "Autocomplete", "Button", "Card", "Checkbox", "Combobox", "Command", "Dialog", "Field", "Input Group", "Tabs"];

export function PrimitiveAutocompleteInputGroupExample() {
  return (
    <div className="w-full max-w-sm">
      <Autocomplete items={PAGES}>
        <AutocompleteInputGroup>
          <InputGroupAddon>
            <SearchIcon className="size-3.5" aria-hidden="true" />
          </InputGroupAddon>
          <AutocompleteInput placeholder="Search components…" aria-label="Search components" />
        </AutocompleteInputGroup>
        <AutocompleteContent>
          <AutocompleteEmpty>No component found.</AutocompleteEmpty>
          <AutocompleteList>
            {(page: string) => (
              <AutocompleteItem key={page} value={page}>
                {page}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  );
}
