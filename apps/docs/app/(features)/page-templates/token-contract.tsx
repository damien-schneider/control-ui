"use client";

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
      <code className="shrink-0 font-mono text-label text-foreground sm:w-56">{token.name}</code>
      <span className="hidden shrink-0 text-caption text-muted-foreground sm:inline sm:w-20">{GROUP_LABELS[token.group]}</span>
      <span className="min-w-0 text-label leading-5 text-muted-foreground">{token.description}</span>
    </div>
  );
}

export function TokenContractTable() {
  return (
    <div className="grid min-w-0 gap-4">
      <div className="docs-panel overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-2 text-caption font-medium text-muted-foreground">
          Core — the <span className="tabular-nums">{coreTokens.length}</span> tokens a skin typically re-values first
        </div>
        <div className="divide-y divide-border">
          {coreTokens.map((token) => (
            <TokenRow key={token.name} token={token} />
          ))}
        </div>
      </div>

      <details className="docs-panel group overflow-hidden">
        <summary className="flex cursor-pointer list-none items-baseline gap-2 px-4 py-2 text-body [&::-webkit-details-marker]:hidden">
          <span className="font-medium">Derived — optional overrides</span>
          <span className="text-caption text-muted-foreground">
            <span className="tabular-nums">{derivedTokens.length}</span> tokens with a core default; re-value one in theme.css only to
            diverge
          </span>
          <span aria-hidden className="ml-auto text-caption text-muted-foreground transition-transform group-open:rotate-90">
            ›
          </span>
        </summary>
        <div className="divide-y divide-border border-t border-border">
          {derivedTokens.map((token) => (
            <TokenRow key={token.name} token={token} />
          ))}
        </div>
      </details>

      {advancedGroups.map(({ group, tokens }) => (
        <details key={group} className="docs-panel group overflow-hidden">
          <summary className="flex cursor-pointer list-none items-baseline gap-2 px-4 py-2 text-body [&::-webkit-details-marker]:hidden">
            <span className="font-medium">Advanced — {GROUP_LABELS[group]}</span>
            <span className="text-caption text-muted-foreground">
              <span className="tabular-nums">{tokens.length}</span> {tokens.length === 1 ? "token" : "tokens"}
            </span>
            <span aria-hidden className="ml-auto text-caption text-muted-foreground transition-transform group-open:rotate-90">
              ›
            </span>
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
