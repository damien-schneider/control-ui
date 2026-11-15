"use client";

import { RotateCcwIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "@/components/control-ui/lib/cn";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerHue,
  ColorPickerTrigger,
} from "@/components/control-ui/ui/color-picker";
import { Input } from "@/components/control-ui/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
import { Slider as RangeSlider } from "@/components/control-ui/ui/slider";
import { Text } from "@/components/control-ui/ui/typography";
import type { ThemeContractToken } from "@/src/registry/lib/theme-contract";
import { cssColorToHexDom, hexToOklchColor } from "./color-utils";
import { resolveLengthPx } from "./read-vars";
import { type SelectSpec, type SliderSpec, tokenControlSpec, tokenLabel } from "./token-metadata";
import type { LabelMode } from "./types";

export function VarTag({ children }: { children: ReactNode }) {
  return (
    <Badge variant="outline" size="sm" render={<code />}>
      <Text size="micro" mono>
        {children}
      </Text>
    </Badge>
  );
}

type TokenFieldProps = {
  token: ThemeContractToken;
  /** Live resolved value of token (from readContractTokens), absent if skin omits it. */
  value: string | undefined;
  labelMode: LabelMode;
  /** True when user authored this token (any bucket) — shows dot + reset affordance. */
  overridden: boolean;
  /** True when active skin authors this token differently than the base theme — hollow provenance dot. */
  changedBySkin: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
};

function displayLabel(token: ThemeContractToken, labelMode: LabelMode): string {
  return labelMode === "css" ? token.name : tokenLabel(token);
}

/** Provenance dot: filled = edited here, hollow = active skin differs from base theme. */
export function ChangeDot({ tone, className }: { tone: "edit" | "skin"; className?: string }) {
  const paint = tone === "edit" ? "bg-primary" : "ring-1 ring-inset ring-primary/70";
  return <span aria-hidden className={cn("size-1.5 rounded-full", paint, className)} />;
}

function TokenHead({ token, labelMode, overridden, changedBySkin, onReset }: Omit<TokenFieldProps, "value" | "onChange">) {
  const label = displayLabel(token, labelMode);
  const hint = changedBySkin && !overridden ? " — differs from the base theme" : "";
  return (
    <span className="flex min-w-0 items-center gap-1.5" title={`${token.name} — ${token.description}${hint}`}>
      {(overridden || changedBySkin) && <ChangeDot tone={overridden ? "edit" : "skin"} />}
      <Text
        size={labelMode === "css" ? "micro" : "caption"}
        weight={labelMode === "css" ? undefined : "medium"}
        tone="muted"
        mono={labelMode === "css"}
        className="min-w-0 truncate"
      >
        {label}
      </Text>
      {overridden ? (
        <Button
          variant="ghost"
          size="xs"
          iconOnly
          onClick={onReset}
          aria-label={`Reset ${label}`}
          title={`Reset ${label} to the skin's value`}
          className="ml-auto shrink-0"
        >
          <RotateCcwIcon aria-hidden />
        </Button>
      ) : null}
    </span>
  );
}

// Commits on blur or Enter, so half-typed CSS never lands as override.
function TextTokenField(props: TokenFieldProps) {
  const { token, value, labelMode, onChange } = props;
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <TokenHead {...props} />
      <Input
        size="xs"
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
      />
    </div>
  );
}

function TokenColorPicker({
  hex,
  label,
  onChange,
  children,
}: {
  hex: string | null;
  label: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <ColorPicker value={hex ?? undefined} alpha={false} defaultFormat="hex" onValueChange={(next) => onChange(hexToOklchColor(next))}>
      {children}
      <ColorPickerContent aria-label={label}>
        <ColorPickerArea />
        <ColorPickerHue />
      </ColorPickerContent>
    </ColorPicker>
  );
}

function ColorTokenField(props: TokenFieldProps) {
  const { token, value, labelMode, onChange } = props;
  // picker speaks #rrggbb while live token can be anything, so round-trip goes through DOM
  const hex = value ? cssColorToHexDom(value) : null;
  if (value !== undefined && hex === null) return <TextTokenField {...props} />;
  const label = displayLabel(token, labelMode);
  return (
    <div className="flex flex-col gap-1.5">
      <TokenHead {...props} />
      <TokenColorPicker hex={hex} label={label} onChange={onChange}>
        <span className="flex min-w-0 items-center gap-2">
          <ColorPickerTrigger aria-label={label} />
          <Text size="micro" tone="muted" mono className="min-w-0 truncate">
            {hex ?? "unset"}
          </Text>
        </span>
      </TokenColorPicker>
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
  // derived token can hydrate as calc() chain, so lengths resolve through probe before slider sees them
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
        // skin may sit outside curated range, and thumb pinned at edge would lie
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
  // getComputedStyle re-serialises whitespace, so match is normalised; anything off-preset shows as "Custom"
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

export function TokenControl(props: TokenFieldProps) {
  const spec = tokenControlSpec(props.token);
  if (spec.kind === "color") return <ColorTokenField {...props} />;
  if (spec.kind === "slider") return <SliderTokenField {...props} spec={spec} />;
  if (spec.kind === "select") return <SelectTokenField {...props} spec={spec} />;
  return <TextTokenField {...props} />;
}

export function MiniColorSwatch({ token, value, overridden, changedBySkin, onChange }: Omit<TokenFieldProps, "labelMode" | "onReset">) {
  const hex = value ? cssColorToHexDom(value) : null;
  return (
    <span className="relative inline-flex" title={`${token.name} — ${token.description}`}>
      <TokenColorPicker hex={hex} label={token.name} onChange={onChange}>
        <ColorPickerTrigger aria-label={token.name} />
      </TokenColorPicker>
      {(overridden || changedBySkin) && <ChangeDot tone={overridden ? "edit" : "skin"} className="absolute -top-0.5 -right-0.5" />}
    </span>
  );
}
