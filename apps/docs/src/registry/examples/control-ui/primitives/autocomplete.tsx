"use client";

// Search-as-you-type, free text: filters via Base UI's built-in filter (mode="list"); picking fills
// input but never locks to discrete value, unlike Combobox. Live Empty state included.

import { useState } from "react";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/control-ui/ui/autocomplete";
import { Text } from "@/components/control-ui/ui/typography";

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
      <Text size="caption" weight="medium" tone="muted">
        Country
      </Text>
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
      <Text size="caption" tone="muted">
        {query ? `Filtering: ${query}` : "Type to filter countries"}
      </Text>
    </div>
  );
}
