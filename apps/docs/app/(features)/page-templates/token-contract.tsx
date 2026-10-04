"use client";

import { Text } from "@/components/control-ui/ui/typography";
import { THEME_CONTRACT, type ThemeContractGroup, type ThemeContractToken } from "@/src/registry/lib/theme-contract";

const GROUP_ORDER = [
  "color",
  "typography",
  "radius",
  "shadow",
  "motion",
  "surface",
  "layout",
] as const satisfies readonly ThemeContractGroup[];

const GROUP_LABELS: Record<ThemeContractGroup, string> = {
  color: "Color",
  typography: "Typography",
  radius: "Radius",
  shadow: "Shadow",
  motion: "Motion",
  surface: "Surface",
  layout: "Layout",
};

const coreTokens = GROUP_ORDER.flatMap((group) => THEME_CONTRACT.filter((token) => token.tier === "core" && token.group === group));

const advancedGroups = GROUP_ORDER.flatMap((group) => {
  const tokens = THEME_CONTRACT.filter((token) => token.tier === "advanced" && token.group === group);
  return tokens.length > 0 ? [{ group, tokens }] : [];
});

const derivedTokens = GROUP_ORDER.flatMap((group) => THEME_CONTRACT.filter((token) => token.tier === "derived" && token.group === group));

function TokenRow({ token }: { token: ThemeContractToken }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 px-4 py-2 sm:flex-row sm:items-baseline sm:gap-3">
      <Text as="code" size="label" tone="foreground" className="shrink-0 font-mono sm:w-56">
        {token.name}
      </Text>
      <Text size="caption" tone="muted" className="hidden shrink-0 sm:inline sm:w-20">
        {GROUP_LABELS[token.group]}
      </Text>
      <Text size="label" tone="muted" className="min-w-0 leading-5">
        {token.description}
      </Text>
    </div>
  );
}

export function TokenContractTable() {
  return (
    <div className="grid min-w-0 gap-4">
      <div className="docs-panel overflow-hidden">
        <Text as="div" size="caption" weight="medium" tone="muted" className="border-b border-border bg-muted/30 px-4 py-2">
          Core — the <span className="tabular-nums">{coreTokens.length}</span> tokens a skin typically re-values first
        </Text>
        <div className="divide-y divide-border">
          {coreTokens.map((token) => (
            <TokenRow key={token.name} token={token} />
          ))}
        </div>
      </div>

      <details className="docs-panel group overflow-hidden">
        <summary className="flex cursor-pointer list-none items-baseline gap-2 px-4 py-2 [&::-webkit-details-marker]:hidden">
          <Text weight="medium">Derived — optional overrides</Text>
          <Text size="caption" tone="muted">
            <span className="tabular-nums">{derivedTokens.length}</span> tokens with a core default; re-value one in theme.css only to
            diverge
          </Text>
          <Text aria-hidden size="caption" tone="muted" className="ml-auto transition-transform group-open:rotate-90">
            ›
          </Text>
        </summary>
        <div className="divide-y divide-border border-t border-border">
          {derivedTokens.map((token) => (
            <TokenRow key={token.name} token={token} />
          ))}
        </div>
      </details>

      {advancedGroups.map(({ group, tokens }) => (
        <details key={group} className="docs-panel group overflow-hidden">
          <summary className="flex cursor-pointer list-none items-baseline gap-2 px-4 py-2 [&::-webkit-details-marker]:hidden">
            <Text weight="medium">Advanced — {GROUP_LABELS[group]}</Text>
            <Text size="caption" tone="muted">
              <span className="tabular-nums">{tokens.length}</span> {tokens.length === 1 ? "token" : "tokens"}
            </Text>
            <Text aria-hidden size="caption" tone="muted" className="ml-auto transition-transform group-open:rotate-90">
              ›
            </Text>
          </summary>
          <div className="divide-y divide-border border-t border-border">
            {tokens.map((token) => (
              <TokenRow key={token.name} token={token} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
