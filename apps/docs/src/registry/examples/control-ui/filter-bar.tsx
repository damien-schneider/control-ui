"use client";

import { CircleIcon, HashIcon, StarIcon, TagIcon, TypeIcon } from "lucide-react";
import { useState } from "react";
import {
  DEFAULT_FILTER_OPERATORS,
  FilterBar,
  type FilterBarField,
  type FilterBarItem,
  type FilterBarScalar,
} from "@/components/control-ui/filter-bar";
import { Text } from "@/components/control-ui/ui/typography";

const fields: readonly FilterBarField[] = [
  {
    id: "status",
    label: "Status",
    icon: <CircleIcon className="size-3.5" aria-hidden="true" />,
    operators: ["is", "is-not", "in"],
    options: [
      { value: "open", label: "Open" },
      { value: "in-progress", label: "In progress" },
      { value: "done", label: "Done" },
    ],
  },
  { id: "title", label: "Title", icon: <TypeIcon className="size-3.5" aria-hidden="true" />, operators: ["contains"] },
  {
    id: "votes",
    label: "Votes",
    icon: <HashIcon className="size-3.5" aria-hidden="true" />,
    type: "number",
    operators: ["is", "gt", "gte", "lt", "lte"],
  },
  { id: "featured", label: "Featured", icon: <StarIcon className="size-3.5" aria-hidden="true" />, type: "boolean", operators: ["is"] },
  {
    id: "labels",
    label: "Labels",
    icon: <TagIcon className="size-3.5" aria-hidden="true" />,
    operators: ["in", "is-empty", "is-not-empty"],
    options: [
      { value: "design", label: "Design" },
      { value: "accessibility", label: "Accessibility" },
      { value: "performance", label: "Performance" },
    ],
  },
];

const issues = [
  { id: "CUI-128", title: "Polish the task composer", status: "in-progress", votes: 18, featured: true, labels: ["design"] },
  { id: "CUI-129", title: "Improve keyboard navigation", status: "open", votes: 12, featured: false, labels: ["accessibility"] },
  { id: "CUI-130", title: "Reduce bundle size", status: "done", votes: 7, featured: true, labels: ["performance"] },
  { id: "CUI-131", title: "Add empty state examples", status: "open", votes: 0, featured: false, labels: [] },
];

type Issue = (typeof issues)[number];

function issueValue(issue: Issue, fieldId: string): FilterBarScalar | FilterBarScalar[] {
  switch (fieldId) {
    case "status":
      return issue.status;
    case "title":
      return issue.title;
    case "votes":
      return issue.votes;
    case "featured":
      return issue.featured;
    case "labels":
      return issue.labels;
    default:
      throw new Error(`Unknown issue field: ${fieldId}`);
  }
}

function matchesIssue(issue: Issue, filter: FilterBarItem) {
  const actual = issueValue(issue, filter.fieldId);
  const values = [actual].flat();
  const wanted = [filter.value].flat();
  switch (filter.operatorId) {
    case "is":
      return values.includes(filter.value === null || Array.isArray(filter.value) ? "" : filter.value);
    case "is-not":
      return !wanted.some((value) => value !== null && values.includes(value));
    case "in":
      return wanted.some((value) => value !== null && values.includes(value));
    case "contains":
      return typeof actual === "string" && typeof filter.value === "string" && actual.toLowerCase().includes(filter.value.toLowerCase());
    case "is-empty":
      return values.length === 0;
    case "is-not-empty":
      return values.length > 0;
    case "gt":
      return typeof actual === "number" && typeof filter.value === "number" && actual > filter.value;
    case "gte":
      return typeof actual === "number" && typeof filter.value === "number" && actual >= filter.value;
    case "lt":
      return typeof actual === "number" && typeof filter.value === "number" && actual < filter.value;
    case "lte":
      return typeof actual === "number" && typeof filter.value === "number" && actual <= filter.value;
    default:
      throw new Error(`Unknown issue operator: ${filter.operatorId}`);
  }
}

function IssueFilters({ input = false }: { input?: boolean }) {
  const [filters, setFilters] = useState<FilterBarItem[]>([]);
  const matching = issues.filter((issue) => filters.every((filter) => matchesIssue(issue, filter)));
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text size="label" weight="semibold">
          Issues
        </Text>
        <Text size="caption" tone="muted" role="status">
          {matching.length} of {issues.length} issues
        </Text>
      </div>
      <FilterBar.Root
        fields={fields}
        operators={DEFAULT_FILTER_OPERATORS}
        value={filters}
        onValueChange={setFilters}
        aria-label="Issue filters"
      >
        <FilterBar.Chips />
        {input && <FilterBar.Input aria-label="Filter issues" placeholder="Filter issues…" />}
        <FilterBar.AddButton />
        <FilterBar.Clear />
      </FilterBar.Root>
      <ul className="divide-y rounded-[var(--radius-lg)] border bg-card">
        {matching.map((issue) => (
          <li key={issue.id} className="flex items-center gap-3 px-4 py-3">
            <Text size="caption" tone="muted">
              {issue.id}
            </Text>
            <Text size="label" className="min-w-0 flex-1">
              {issue.title}
            </Text>
            <Text size="caption" tone="muted" className="shrink-0">
              {issue.status.replace("-", " ")}
            </Text>
          </li>
        ))}
        {matching.length === 0 && (
          <Text as="li" size="caption" tone="muted" className="px-4 py-6 text-center">
            No issues match these filters.
          </Text>
        )}
      </ul>
    </div>
  );
}

export function FilterBarExample() {
  return <IssueFilters />;
}
export function FilterBarInputExample() {
  return <IssueFilters input />;
}
