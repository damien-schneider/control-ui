"use client";

import { UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_FILTER_OPERATORS,
  FilterBar,
  type FilterBarField,
  type FilterBarItem,
  type FilterBarOption,
  type FilterBarQuery,
  type FilterBarScalar,
} from "@/components/control-ui/filter-bar";

const assignees: readonly FilterBarOption[] = [
  { value: "maya", label: "Maya Chen" },
  { value: "leo", label: "Leo Martin" },
  { value: "amara", label: "Amara Okafor" },
  { value: "noah", label: "Noah Williams" },
];

function loadAssignees(query: string, signal: AbortSignal): Promise<FilterBarOption[]> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      if (query.toLowerCase() === "offline") reject(new Error("Couldn’t load assignees. Try another search."));
      else resolve(assignees.filter((assignee) => assignee.label.toLowerCase().includes(query.toLowerCase())));
    }, 350);
    function abort() {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }
    signal.addEventListener("abort", abort, { once: true });
  });
}

function formatAssignee(value: FilterBarScalar) {
  return assignees.find((assignee) => assignee.value === value)?.label ?? String(value);
}

export function FilterBarRemoteExample() {
  const [filters, setFilters] = useState<FilterBarItem[]>([]);
  const [search, setSearch] = useState<{
    status: "ready" | "loading" | "error";
    options: FilterBarOption[];
    error?: string;
  }>({ status: "ready", options: [] });
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  function searchAssignees({ query }: FilterBarQuery) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setSearch({ status: "loading", options: [] });
    loadAssignees(query, controller.signal).then(
      (options) => {
        if (!controller.signal.aborted) setSearch({ status: "ready", options });
      },
      (failure: unknown) => {
        if (!controller.signal.aborted)
          setSearch({ status: "error", options: [], error: failure instanceof Error ? failure.message : "Couldn’t load assignees." });
      },
    );
  }

  const fields: FilterBarField[] = [
    {
      id: "assignee",
      label: "Assignee",
      icon: <UserIcon className="size-3.5" aria-hidden="true" />,
      operators: ["is", "in"],
      optionsMode: "remote",
      options: search.options,
      loading: search.status === "loading",
      error: search.error,
      onQueryChange: searchAssignees,
      formatValue: formatAssignee,
    },
  ];
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <FilterBar.Root
        fields={fields}
        operators={DEFAULT_FILTER_OPERATORS}
        value={filters}
        onValueChange={setFilters}
        aria-label="Assignee filters"
      >
        <FilterBar.Chips />
        <FilterBar.AddButton />
        <FilterBar.Clear />
      </FilterBar.Root>
      <p className="text-caption text-muted-foreground">Search assignees from a simulated API. Type “offline” to try its error state.</p>
      <span className="text-caption" role="status">
        {filters.length === 0
          ? "All assignees"
          : filters
              .map((filter) =>
                [filter.value]
                  .flat()
                  .filter((value) => value !== null)
                  .map(formatAssignee)
                  .join(", "),
              )
              .join(" · ")}
      </span>
    </div>
  );
}
