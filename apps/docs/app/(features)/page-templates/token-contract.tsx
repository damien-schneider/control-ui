"use client";

import { THEME_CONTRACT, type ThemeContractGroup, type ThemeContractToken } from "@/src/registry/lib/theme-contract";

/*
 * Visible face of the token contract SSOT: lib/theme-contract.ts feeds the coverage test (theme-contract-coverage.test.ts) AND this reference — docs never hand-maintain a token list.
 * Core tokens render open; advanced knobs collapse into one native <details> per group, CSS-first — 170-row tail costs no JS/state.
 */

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
      <div className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="border-b border-border/70 bg-muted/30 px-4 py-2 text-caption font-medium text-muted-foreground">
          Core — the {coreTokens.length} tokens a skin typically re-values first
        </div>
        <div className="divide-y divide-border/50">
          {coreTokens.map((token) => (
            <TokenRow key={token.name} token={token} />
          ))}
        </div>
      </div>

      {advancedGroups.map(({ group, tokens }) => (
        <details key={group} className="group min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <summary className="flex cursor-pointer list-none items-baseline gap-2 px-4 py-2 text-body [&::-webkit-details-marker]:hidden">
            <span className="font-medium">Advanced — {GROUP_LABELS[group]}</span>
            <span className="text-caption text-muted-foreground">
              {tokens.length} {tokens.length === 1 ? "token" : "tokens"}
            </span>
            <span aria-hidden className="ml-auto text-caption text-muted-foreground transition-transform group-open:rotate-90">
              ›
            </span>
          </summary>
          <div className="divide-y divide-border/50 border-t border-border/70">
            {tokens.map((token) => (
              <TokenRow key={token.name} token={token} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
