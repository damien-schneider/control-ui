"use client";

import type { ReactNode } from "react";
import { VarTag } from "@/components/theme-drawer/controls";
import { THEME_CONTRACT, THEME_CONTRACT_NAMES, type ThemeContractGroup } from "@/src/registry/lib/theme-contract";
import { useContractTokens } from "./theme-readouts";

export function contractTokenNames(group: ThemeContractGroup) {
  return THEME_CONTRACT.filter((token) => token.group === group).map((token) => token.name);
}

export function contractTokensNamed(names: readonly string[]) {
  return names.filter((name) => THEME_CONTRACT_NAMES.has(name));
}

export function contractDescription(name: string) {
  return THEME_CONTRACT.find((token) => token.name === name)?.description;
}

export function SpecimenGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 grid min-w-0 gap-3">
      <h3 className="text-heading-4 font-display text-foreground">{title}</h3>
      {children}
    </div>
  );
}

export function Specimen({
  token,
  companionTokens = [],
  readout,
  description,
  children,
}: {
  token: string;
  companionTokens?: readonly string[];
  readout?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <figure className="grid min-w-0 content-start gap-2">
      {children}
      <figcaption className="grid gap-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <VarTag>{token}</VarTag>
          {companionTokens.map((companion) => (
            <VarTag key={companion}>{companion}</VarTag>
          ))}
          {readout ? <span className="font-mono text-micro tabular-nums text-muted-foreground">{readout}</span> : null}
        </span>
        {description ? <span className="text-caption leading-4 text-muted-foreground">{description}</span> : null}
      </figcaption>
    </figure>
  );
}

export function TokenValueList({ names }: { names: readonly string[] }) {
  const tokens = useContractTokens();
  return (
    <dl className="grid min-w-0 gap-x-6 sm:grid-cols-2">
      {names.map((name) => (
        <div key={name} className="flex min-w-0 items-center justify-between gap-3 border-b border-border py-1.5">
          <dt className="shrink-0">
            <VarTag>{name}</VarTag>
          </dt>
          <dd className="min-w-0 truncate font-mono text-micro text-muted-foreground" title={tokens[name]}>
            {tokens[name] ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
