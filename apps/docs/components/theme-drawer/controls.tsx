"use client";

import { RotateCcwIcon } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";

import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
import { Slider as RangeSlider } from "@/components/control-ui/ui/slider";
import type { ThemeContractToken } from "@/src/registry/lib/theme-contract";
import { cssColorToHexDom, hexToOklchColor } from "./color-utils";
import { resolveLengthPx } from "./read-vars";
import { type SelectSpec, type SliderSpec, tokenControlSpec, tokenLabel } from "./token-metadata";
import type { LabelMode } from "./types";

export function VarTag({ children }: { children: ReactNode }) {
  return (
    <code className="inline-flex max-w-full items-center rounded-[var(--radius-sm)] bg-foreground/5 px-1.5 py-0.5 font-mono text-[9px] leading-none text-muted-foreground ring-1 ring-inset ring-border/70">
      <span className="min-w-0 break-all">{children}</span>
    </code>
  );
}

// ─── Shared per-token frame ───────────────────────────────────────────────────

type TokenFieldProps = {
  token: ThemeContractToken;
  /** Live resolved value of the token (from readContractTokens), absent if the skin omits it. */
  value: string | undefined;
  labelMode: LabelMode;
  /** True when the user authored this token (any bucket) — shows the dot + reset affordance. */
  overridden: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
};

function displayLabel(token: ThemeContractToken, labelMode: LabelMode): string {
  return labelMode === "css" ? token.name : tokenLabel(token);
}

function TokenHead({ token, labelMode, overridden, onReset }: Omit<TokenFieldProps, "value" | "onChange">) {
  const label = displayLabel(token, labelMode);
  return (
    <span className="flex min-w-0 items-center gap-1.5" title={`${token.name} — ${token.description}`}>
      {overridden ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
      <span
        className={cn(
          "min-w-0 truncate",
          labelMode === "css" ? "font-mono text-[10px] text-muted-foreground" : "text-[11px] font-medium text-muted-foreground",
        )}
      >
        {label}
      </span>
      {overridden ? (
        <button
          type="button"
          onClick={onReset}
          aria-label={`Reset ${label}`}
          title={`Reset ${label} to the skin's value`}
          className="ml-auto inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <RotateCcwIcon aria-hidden className="size-2.5" />
        </button>
      ) : null}
    </span>
  );
}

// ─── Kind-specific controls ───────────────────────────────────────────────────

// Free-form value editor — the honest fallback for tokens whose live value isn't a color, a plain
// number, or a known preset (font stacks, calc() chains, cubic-bezier curves). Commits on blur /
// Enter so half-typed CSS never lands as an override; Escape abandons the draft.
function TextTokenField(props: TokenFieldProps) {
  const { token, value, labelMode, onChange } = props;
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <TokenHead {...props} />
      <input
        type="text"
        aria-label={displayLabel(token, labelMode)}
        value={draft ?? value ?? ""}
        placeholder="CSS value"
        spellCheck={false}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setDraft(value ?? "")}
        onBlur={() => {
          if (draft !== null) {
            const next = draft.trim();
            if (next && next !== value) onChange(next);
          }
          setDraft(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(null);
            e.currentTarget.blur();
          }
        }}
        className="h-7 w-full rounded-[var(--radius-control)] border border-border bg-card/70 px-2 font-mono text-[10px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/60"
      />
    </div>
  );
}

function ColorTokenField(props: TokenFieldProps) {
  const { token, value, labelMode, onChange } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  // The picker speaks #rrggbb; the live token can be oklch()/lab()/anything — round-trip through
  // the DOM (format-proof). Edits are authored back in the tokens' oklch format.
  const hex = value ? cssColorToHexDom(value) : null;
  if (value !== undefined && hex === null) return <TextTokenField {...props} />;
  return (
    <div className="flex flex-col gap-1.5">
      <TokenHead {...props} />
      <Button
        variant="ghost"
        size="md"
        aria-label={displayLabel(token, labelMode)}
        className="w-full justify-start"
        onClick={() => inputRef.current?.click()}
      >
        <span
          aria-hidden
          className="size-5 shrink-0 rounded-[var(--radius-sm)] shadow-[inset_0_0_0_1px_oklch(from_var(--foreground)_l_c_h_/_0.16)]"
          style={{ backgroundColor: hex ?? "transparent" }}
        />
        <span className="min-w-0 truncate font-mono text-[10px] text-muted-foreground">{hex ?? "unset"}</span>
      </Button>
      <input
        ref={inputRef}
        type="color"
        aria-label={displayLabel(token, labelMode)}
        tabIndex={-1}
        value={hex ?? "#000000"}
        onChange={(e) => onChange(hexToOklchColor(e.target.value))}
        className="sr-only"
      />
    </div>
  );
}

function formatSliderValue(spec: SliderSpec, v: number): string {
  if (spec.unit === "px") return `${Math.round(v)}px`;
  if (spec.unit === "ms") return `${Math.round(v)}ms`;
  return String(Math.round(v * 100) / 100);
}

function SliderTokenField(props: TokenFieldProps & { spec: SliderSpec }) {
  const { token, value, labelMode, spec, onChange } = props;
  // A derived token can hydrate as a calc() chain — resolve lengths through the probe so the
  // slider still shows the concrete pixel value. Unresolvable → honest text input.
  const num = (() => {
    if (value === undefined) return null;
    if (spec.unit === "px") return resolveLengthPx(value);
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  })();
  if (num === null) return <TextTokenField {...props} />;
  return (
    <div className="flex flex-col gap-1.5">
      <TokenHead {...props} />
      <RangeSlider
        variant="plain"
        aria-label={displayLabel(token, labelMode)}
        showValue
        formatValue={(v) => formatSliderValue(spec, v)}
        value={num}
        // A skin may sit outside the curated range (a 72px control height) — widen to include it
        // so the thumb never lies pinned at an edge.
        min={Math.min(spec.min, num)}
        max={Math.max(spec.max, num)}
        step={spec.step}
        onValueChange={(v) => onChange(`${Math.round(v * 100) / 100}${spec.unit}`)}
      />
    </div>
  );
}

const normalizeCssValue = (v: string) => v.trim().replace(/\s+/g, " ");

function SelectTokenField(props: TokenFieldProps & { spec: SelectSpec }) {
  const { token, value, labelMode, spec, onChange } = props;
  // Match the live value back to a preset (getComputedStyle re-serialises whitespace); a skin
  // value outside the presets displays as "Custom" until an option is picked.
  const matched = value === undefined ? undefined : spec.options.find((o) => normalizeCssValue(o.value) === normalizeCssValue(value));
  return (
    <div className="flex flex-col gap-1.5">
      <TokenHead {...props} />
      <Select value={matched?.value ?? value ?? ""} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger size="sm" className="w-full" aria-label={displayLabel(token, labelMode)}>
          <SelectValue>{(v: string) => spec.options.find((o) => o.value === v)?.label ?? "Custom"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {spec.options.map((option) => (
            <SelectItem key={option.label} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// One control per contract token, typed from token-metadata. This is what makes the editor a
// faithful mirror of theme.css: every token gets ITS OWN picker, chosen by what the token holds.
export function TokenControl(props: TokenFieldProps) {
  const spec = tokenControlSpec(props.token);
  if (spec.kind === "color") return <ColorTokenField {...props} />;
  if (spec.kind === "slider") return <SliderTokenField {...props} spec={spec} />;
  if (spec.kind === "select") return <SelectTokenField {...props} spec={spec} />;
  return <TextTokenField {...props} />;
}

// Keep each color family's four badge tokens compact; full token rows would drown the palette.
export function MiniColorSwatch({ token, value, overridden, onChange }: Omit<TokenFieldProps, "labelMode" | "onReset">) {
  const hex = value ? cssColorToHexDom(value) : null;
  return (
    <span className="relative inline-flex" title={`${token.name} — ${token.description}`}>
      <span
        aria-hidden
        className="size-6 rounded-[var(--radius-sm)] shadow-[inset_0_0_0_1px_oklch(from_var(--foreground)_l_c_h_/_0.16)]"
        style={{ backgroundColor: hex ?? "transparent" }}
      />
      {overridden ? <span aria-hidden className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-primary" /> : null}
      <input
        type="color"
        aria-label={token.name}
        value={hex ?? "#000000"}
        onChange={(e) => onChange(hexToOklchColor(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </span>
  );
}
