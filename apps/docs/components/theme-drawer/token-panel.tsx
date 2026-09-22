"use client";

import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/control-ui/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import type { ThemeContractToken } from "@/src/registry/lib/theme-contract";
import { MiniColorSwatch, TokenControl } from "./controls";
import { BADGE_TOKEN_ROWS, type TokenCategory, tokenControlSpec } from "./token-metadata";
import type { LabelMode, TokenValues } from "./types";

export type TokenEditorProps = {
  values: TokenValues;
  labelMode: LabelMode;
  overridden: Set<string>;
  changedBySkin: ReadonlySet<string>;
  onChange: (name: string, value: string) => void;
  onReset: (name: string) => void;
};

function TokenList({
  tokens,
  values,
  labelMode,
  overridden,
  changedBySkin,
  onChange,
  onReset,
}: TokenEditorProps & { tokens: ThemeContractToken[] }) {
  const renderTokenControl = (token: ThemeContractToken) => (
    <TokenControl
      key={token.name}
      token={token}
      value={values[token.name]}
      labelMode={labelMode}
      overridden={overridden.has(token.name)}
      changedBySkin={changedBySkin.has(token.name)}
      onChange={(value) => onChange(token.name, value)}
      onReset={() => onReset(token.name)}
    />
  );

  const nodes: ReactNode[] = [];
  let colorRun: ThemeContractToken[] = [];
  const appendColorControls = () => {
    if (colorRun.length === 0) return;
    nodes.push(
      <div key={`colors-${colorRun[0].name}`} className="grid grid-cols-2 gap-2.5">
        {colorRun.map(renderTokenControl)}
      </div>,
    );
    colorRun = [];
  };
  for (const token of tokens) {
    if (tokenControlSpec(token).kind === "color") colorRun.push(token);
    else {
      appendColorControls();
      nodes.push(renderTokenControl(token));
    }
  }
  appendColorControls();
  return <div className="flex flex-col gap-3">{nodes}</div>;
}

function BadgePaletteRows({ values, overridden, changedBySkin, onChange, onReset }: Omit<TokenEditorProps, "labelMode">) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 px-0.5 text-micro font-medium text-muted-foreground">
        <span className="flex-1" />
        <span className="w-6 text-center">Fill</span>
        <span className="w-6 text-center">Text</span>
        <span className="w-6 text-center">Line</span>
        <span className="w-6 text-center">Hover</span>
      </div>
      {BADGE_TOKEN_ROWS.map((row) => {
        const touched = row.tokens.some((token) => overridden.has(token.name));
        return (
          <div key={row.color} className="flex items-center gap-2 px-0.5">
            <span className="min-w-0 flex-1 truncate text-caption font-medium text-muted-foreground">
              {row.color}
              {touched ? (
                <button
                  type="button"
                  onClick={() => {
                    for (const token of row.tokens) onReset(token.name);
                  }}
                  className="ml-1.5 cursor-pointer text-micro text-primary underline-offset-2 hover:underline"
                >
                  reset
                </button>
              ) : null}
            </span>
            {row.tokens.map((token) => (
              <MiniColorSwatch
                key={token.name}
                token={token}
                value={values[token.name]}
                overridden={overridden.has(token.name)}
                changedBySkin={changedBySkin.has(token.name)}
                onChange={(value) => onChange(token.name, value)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function TokenPanel({
  category,
  editor,
  headerAction,
  beforeTokens,
  afterCore,
}: {
  category: TokenCategory;
  editor: TokenEditorProps;
  headerAction: ReactNode;
  beforeTokens?: ReactNode;
  afterCore?: ReactNode;
}) {
  const isColor = category.group === "color";
  const badgeTokens = isColor ? BADGE_TOKEN_ROWS.flatMap((row) => row.tokens) : [];
  const allNames = [...category.core, ...category.advanced, ...badgeTokens].map((token) => token.name);
  const touched = allNames.filter((name) => editor.overridden.has(name)).length;
  const skinTouched = allNames.filter((name) => editor.changedBySkin.has(name)).length;
  const advancedTotal = category.advanced.length + badgeTokens.length;

  return (
    <section id="theme-tokens" aria-labelledby="theme-tokens-title" className="flex min-w-0 flex-col gap-4">
      <header className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="theme-tokens-title" className="text-heading-4 font-semibold text-foreground">
            {category.title}
          </h2>
          {touched > 0 ? <Badge size="sm">{touched} edited</Badge> : null}
          <span className="ml-auto">{headerAction}</span>
        </div>
        <p className="mt-1 text-micro leading-4 text-muted-foreground">{category.description}</p>
        <p className="mt-1 text-micro tabular-nums text-muted-foreground">
          {allNames.length} tokens
          {skinTouched > 0 ? ` · ${skinTouched} set by the skin` : ""}
        </p>
      </header>

      {beforeTokens}
      <TokenList tokens={category.core} {...editor} />
      {afterCore}

      {advancedTotal > 0 ? (
        <Collapsible className="border-border/70 border-t pt-3">
          <CollapsibleTrigger>
            <ChevronDownIcon
              aria-hidden
              className="size-3 text-muted-foreground transition-transform in-data-[state=open]:rotate-180 motion-reduce:transition-none"
            />
            <span className="text-caption font-semibold text-foreground">Advanced</span>
            <span className="ml-auto text-micro tabular-nums text-muted-foreground">{advancedTotal}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-4 pt-3">
              <p className="text-micro text-muted-foreground">Derived and fine-grained values</p>
              <TokenList tokens={category.advanced} {...editor} />
              {isColor ? (
                <div className="flex flex-col gap-2">
                  <span className="text-caption font-medium text-muted-foreground">Badge palette</span>
                  <BadgePaletteRows
                    values={editor.values}
                    overridden={editor.overridden}
                    changedBySkin={editor.changedBySkin}
                    onChange={editor.onChange}
                    onReset={editor.onReset}
                  />
                </div>
              ) : null}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </section>
  );
}
