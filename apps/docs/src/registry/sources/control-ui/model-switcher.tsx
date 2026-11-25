"use client";

import type { ReactNode, RefObject } from "react";
import { useRef, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { modelIdentity } from "@/components/control-ui/lib/model-name";
import { PROVIDER_MARKS } from "@/components/control-ui/lib/provider-marks";
import { ProviderLogo } from "@/components/control-ui/provider-logo";
import type { SkinIconProps } from "@/components/control-ui/skin";
import { useSkinIcon } from "@/components/control-ui/skin-provider";
import { levelFill, type ThinkingLevel, ThinkingLevelBrain, ThinkingLevelRamp } from "@/components/control-ui/thinking-level";
import { Button, type ButtonProps } from "@/components/control-ui/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/control-ui/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/control-ui/ui/popover";

export type { ThinkingLevel } from "@/components/control-ui/thinking-level";

export type ModelOption = {
  /** A model id; without a label it reads as the model's name: `claude-opus-4-5` → `Claude Opus 4.5`. */
  value: string;
  label?: string;
  /** Who serves the model (`anthropic`, `groq`); picks the logo when the id doesn't name its maker. */
  provider?: string;
  hint?: ReactNode;
  /** Replaces the maker's logo; `null` shows none. */
  icon?: ReactNode;
};

export type ModelThinking = {
  levels: readonly ThinkingLevel[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  /** Submits the selected level with the surrounding form. */
  name?: string;
};

export type ModelSwitcherProps = Omit<ButtonProps, "children" | "value" | "defaultValue" | "size" | "name" | "form" | "onChange"> & {
  models: readonly ModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "xs" | "sm";
  label?: string;
  searchLabel?: string;
  emptyMessage?: string;
  /** Submits the selected model with the surrounding form. */
  name?: string;
  form?: string;
  /** How hard the model thinks, set on a ramp under the model list. */
  thinking?: ModelThinking;
};

// Owned here rather than handed to the primitive as a default: options often load after mount, and a default is only read once.
function usePicked(
  options: readonly { value: string }[],
  value: string | undefined,
  defaultValue: string | undefined,
  onValueChange?: (value: string) => void,
) {
  const [picked, setPicked] = useState(defaultValue);
  const selected = value ?? picked ?? options[0]?.value;
  function pick(next: string) {
    setPicked(next);
    onValueChange?.(next);
  }
  return [selected, pick] as const;
}

type ResolvedModel = ModelOption & { label: string; lab: string | undefined };

function resolveModel(option: ModelOption): ResolvedModel {
  const identity = modelIdentity(option.value, option.provider);
  const logo = identity.lab ? <ProviderLogo provider={identity.lab} /> : null;
  return { ...option, label: option.label ?? identity.name, lab: identity.lab, icon: option.icon === undefined ? logo : option.icon };
}

const makerName = (lab: string | undefined) => (lab ? (PROVIDER_MARKS[lab]?.name ?? lab) : "Other");

/** Headings only pay off when a maker has several models; one model per maker reads fine as a flat list. */
function groupByMaker(options: readonly ResolvedModel[]) {
  const groups = new Map<string | undefined, ResolvedModel[]>();
  for (const option of options) groups.set(option.lab, [...(groups.get(option.lab) ?? []), option]);
  const grouped = groups.size > 1 && [...groups.values()].some((group) => group.length > 1);
  return grouped ? [...groups].map(([lab, models]) => ({ heading: makerName(lab), models })) : [{ heading: undefined, models: options }];
}

const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[\s\-_./:]+/)
    .filter(Boolean);

/** Every typed word must start a word of the model's name, id, or maker: `opus 4` finds `claude-opus-4-5`. */
function matchModel(value: string, search: string, keywords?: string[]) {
  const haystack = words([value, ...(keywords ?? [])].join(" "));
  return words(search).every((word) => haystack.some((candidate) => candidate.startsWith(word))) ? 1 : 0;
}

function OptionIcon({ icon }: { icon: ReactNode }) {
  return icon ? (
    <span aria-hidden="true" data-control-ui="model-switcher" data-control-family="model-switcher" data-slot="logo">
      {icon}
    </span>
  ) : null;
}

const FLUSH_SEPARATOR = { "--cui-popup-separator-inset": "0px", "--cui-popup-separator-gap": "0px" };

function ModelSwitcherCheckIcon(props: SkinIconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ModelSwitcherChevronIcon(props: SkinIconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type ModelCommandProps = {
  label: string;
  emptyMessage: string;
  options: ResolvedModel[];
  selected: string | undefined;
  search: RefObject<HTMLInputElement | null>;
  divided: boolean;
  onPick: (value: string) => void;
};

function ModelCommand({ label, emptyMessage, options, selected, search, divided, onPick }: ModelCommandProps) {
  const CheckGlyph = useSkinIcon("check", ModelSwitcherCheckIcon);
  return (
    <Command chrome="embedded" label={label} filter={matchModel}>
      <CommandInput ref={search} placeholder={`${label}…`} />
      <CommandList>
        <CommandEmpty title={emptyMessage} />
        {groupByMaker(options).map((group) => (
          <CommandGroup key={group.heading ?? "models"} heading={group.heading}>
            {group.models.map((option) => {
              const current = option.value === selected;
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label, makerName(option.lab)]}
                  data-current={current ? "" : undefined}
                  onSelect={() => onPick(option.value)}
                >
                  <OptionIcon icon={option.icon} />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.hint ? (
                    <span data-control-ui="model-switcher" data-control-family="model-switcher" data-slot="hint">
                      {option.hint}
                    </span>
                  ) : null}
                  <span aria-hidden="true" data-control-ui="model-switcher" data-control-family="model-switcher" data-slot="check">
                    <CheckGlyph aria-hidden="true" />
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
      {divided ? <CommandSeparator alwaysRender style={FLUSH_SEPARATOR} /> : null}
    </Command>
  );
}

export function ModelSwitcher({
  models,
  value,
  defaultValue,
  onValueChange,
  disabled,
  size = "sm",
  variant = "surface",
  className,
  label = "Model",
  searchLabel = "Search models",
  emptyMessage = "No models found",
  name,
  form,
  thinking,
  "aria-labelledby": ariaLabelledby,
  ...props
}: ModelSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ChevronDownGlyph = useSkinIcon("chevronDown", ModelSwitcherChevronIcon);
  const search = useRef<HTMLInputElement>(null);
  const options = models.map(resolveModel);
  const [selected, pick] = usePicked(options, value, defaultValue, onValueChange);
  const [level, pickLevel] = usePicked(thinking?.levels ?? [], thinking?.value, thinking?.defaultValue, thinking?.onValueChange);
  const thinkingLabel = thinking?.label ?? "Thinking";
  const model = options.find((option) => option.value === selected);
  const levelOption = thinking?.levels.find((option) => option.value === level);
  const accessibleName = [`${label}: ${model?.label ?? "none"}`, levelOption ? `${thinkingLabel}: ${levelOption.label}` : null]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant={variant} size={size} />}
          disabled={disabled || models.length === 0}
          className={cn("max-w-72 min-w-0 shrink gap-1.5", className)}
          aria-label={ariaLabelledby ? undefined : accessibleName}
          aria-labelledby={ariaLabelledby}
          {...props}
        >
          <OptionIcon icon={model?.icon} />
          <span data-control-ui="model-switcher" data-control-family="model-switcher" data-slot="value" className="truncate">
            {model?.label ?? label}
          </span>
          {thinking && levelOption ? <ThinkingLevelBrain depth={levelFill(thinking.levels, levelOption.value)} /> : null}
          {levelOption ? (
            <span data-control-ui="model-switcher" data-control-family="model-switcher" data-slot="level">
              {levelOption.label}
            </span>
          ) : null}
          <span aria-hidden="true" data-control-ui="model-switcher" data-control-family="model-switcher" data-slot="chevron">
            <ChevronDownGlyph aria-hidden="true" />
          </span>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" padding="none" initialFocus={search} className="w-[min(20rem,calc(100vw-2rem))]">
          <div data-control-ui="model-switcher" data-control-family="model-switcher" data-slot="panel" className="flex flex-col">
            <ModelCommand
              label={searchLabel}
              emptyMessage={emptyMessage}
              options={options}
              selected={selected}
              search={search}
              divided={Boolean(thinking)}
              onPick={(next) => {
                pick(next);
                setOpen(false);
              }}
            />
            {thinking ? (
              <div data-control-ui="model-switcher" data-control-family="model-switcher" data-slot="settings">
                <ThinkingLevelRamp label={thinkingLabel} levels={thinking.levels} value={level} onValueChange={pickLevel} />
              </div>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      {name && selected ? <input type="hidden" name={name} form={form} value={selected} /> : null}
      {thinking?.name && level ? <input type="hidden" name={thinking.name} form={form} value={level} /> : null}
    </>
  );
}
