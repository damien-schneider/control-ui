import type { ReactNode } from "react";
import { Badge } from "@/components/control-ui/ui/badge";
import type { ThemeContractToken } from "@/src/registry/lib/theme-contract";
import { MiniColorSwatch, TokenControl } from "./controls";
import { BADGE_TOKEN_ROWS, type TokenCategory, tokenControlSpec } from "./token-metadata";
import type { LabelMode, TokenValues } from "./types";

export function ElevationPreview() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <span className="rounded-[var(--radius-control)] bg-card p-3 text-[9px] font-medium text-muted-foreground shadow-sm">Control</span>
      <span className="rounded-[var(--radius-control)] bg-popover p-3 text-[9px] font-medium text-muted-foreground shadow-pop">
        Popover
      </span>
      <span className="rounded-[var(--radius-control)] bg-card p-3 text-[9px] font-medium text-muted-foreground shadow-modal">Modal</span>
    </div>
  );
}

export function LayerPreview({ values }: { values: TokenValues }) {
  const overlayOpacity = Number.parseFloat(values["--overlay-opacity"] ?? "");
  return (
    <div className="relative min-h-24 overflow-hidden rounded-[var(--radius-control)] bg-canvas p-3 ring-1 ring-inset ring-border">
      <div
        className="absolute inset-0 bg-foreground backdrop-blur-[var(--backdrop-blur-overlay)]"
        style={{ opacity: Number.isNaN(overlayOpacity) ? 0.2 : overlayOpacity }}
      />
      <div className="relative ml-auto w-4/5 rounded-[var(--radius-popover)] bg-popover p-3 text-[10px] text-popover-foreground shadow-pop backdrop-blur-[var(--backdrop-blur-popover)]">
        Popover surface
      </div>
    </div>
  );
}

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
      <div className="flex items-center gap-2 px-0.5 text-[9px] font-medium text-muted-foreground">
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
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-muted-foreground">
              {row.color}
              {touched ? (
                <button
                  type="button"
                  onClick={() => {
                    for (const token of row.tokens) onReset(token.name);
                  }}
                  className="ml-1.5 cursor-pointer text-[9px] text-primary underline-offset-2 hover:underline"
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

export function TokenCategorySection({
  category,
  editor,
  preview,
  afterCore,
  beforeTokens,
}: {
  category: TokenCategory;
  editor: TokenEditorProps;
  preview?: ReactNode;
  afterCore?: ReactNode;
  beforeTokens?: ReactNode;
}) {
  const isColor = category.group === "color";
  const badgeTokens = isColor ? BADGE_TOKEN_ROWS.flatMap((row) => row.tokens) : [];
  const allNames = [...category.core, ...category.advanced, ...badgeTokens].map((token) => token.name);
  const touched = allNames.filter((name) => editor.overridden.has(name)).length;
  const skinTouched = allNames.filter((name) => editor.changedBySkin.has(name)).length;
  const advancedTotal = category.advanced.length + badgeTokens.length;

  return (
    <section
      id={`theme-tokens-${category.group}`}
      aria-labelledby={`theme-tokens-${category.group}-title`}
      className="grid scroll-mt-6 gap-5 border-border/70 border-t py-7 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8"
    >
      <header className="min-w-0 lg:sticky lg:top-0 lg:z-10 lg:self-start lg:-mx-2 lg:bg-background/95 lg:px-2 lg:py-2 lg:backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h4 id={`theme-tokens-${category.group}-title`} className="text-[12px] font-semibold text-foreground">
            {category.title}
          </h4>
          <span className="text-[9px] tabular-nums text-muted-foreground">
            {allNames.length} tokens
            {skinTouched > 0 ? ` · ${skinTouched} by skin` : ""}
          </span>
          {touched > 0 ? <Badge size="sm">{touched} edited</Badge> : null}
        </div>
        <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">{category.description}</p>
        {preview ? <div className="mt-4">{preview}</div> : null}
      </header>
      <div className="min-w-0">
        {beforeTokens ? <div className="mb-4">{beforeTokens}</div> : null}
        <TokenList tokens={category.core} {...editor} />
        {afterCore ? <div className="mt-5">{afterCore}</div> : null}
        {advancedTotal > 0 ? (
          <div className="mt-6 border-border/70 border-t pt-5">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <div>
                <h5 className="text-[11px] font-semibold text-foreground">Advanced</h5>
                <p className="mt-0.5 text-[9px] text-muted-foreground">Derived and fine-grained values</p>
              </div>
              <span className="text-[9px] tabular-nums text-muted-foreground">{advancedTotal} tokens</span>
            </div>
            <div className="flex flex-col gap-4">
              <TokenList tokens={category.advanced} {...editor} />
              {isColor ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">Badge palette</span>
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
          </div>
        ) : null}
      </div>
    </section>
  );
}
