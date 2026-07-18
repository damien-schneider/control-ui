"use client";

// Search-as-you-type, free text: filters via Base UI's built-in filter (mode="list"); picking fills
// the input but never locks to a discrete value, unlike Combobox. Live Empty state included.

import { useState } from "react";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/control-ui/ui/autocomplete";

const COUNTRIES = [
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Canada",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Iceland",
  "India",
  "Ireland",
  "Italy",
  "Japan",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Poland",
  "Portugal",
  "Singapore",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "United Kingdom",
  "United States",
];

export function PrimitiveAutocompleteExample() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">Country</span>
      <Autocomplete items={COUNTRIES} value={query} onValueChange={setQuery}>
        <AutocompleteInput placeholder="Search countries…" aria-label="Country" />
        <AutocompleteContent>
          <AutocompleteEmpty>No country found.</AutocompleteEmpty>
          <AutocompleteList>
            {(country: string) => (
              <AutocompleteItem key={country} value={country}>
                {country}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
      <span className="text-[11px] text-muted-foreground">{query ? `Filtering: ${query}` : "Type to filter countries"}</span>
    </div>
  );
}
