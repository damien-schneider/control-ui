"use client";

import type { ChangeEventHandler, ComponentProps, ComponentType, CSSProperties, Ref, SVGProps } from "react";
import { useState } from "react";
import type { EmbeddedFlagProps, Labels } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import PhoneNumberInput, { type Country, getCountryCallingCode, parsePhoneNumber, type Value } from "react-phone-number-input/max";

import type { ControlSize } from "@/components/control-ui/control-variants";
import type { PhoneInputKnobStyle } from "@/components/control-ui/knob-contracts/phone-input-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { normalizePhoneInputText, normalizePhoneInputValue } from "@/components/control-ui/lib/phone-input-format";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/control-ui/ui/command";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/control-ui/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/control-ui/ui/popover";

export type PhoneInputValue = Value;
export type PhoneInputCountry = Country;

type CountryOptionOrder = PhoneInputCountry | "XX" | "🌐" | "|" | "..." | "…";

export type PhoneInputProps = Omit<ComponentProps<"input">, "defaultValue" | "size" | "style" | "type" | "value"> & {
  size?: ControlSize;
  value?: PhoneInputValue | string;
  defaultValue?: PhoneInputValue | string;
  onValueChange?: (value?: PhoneInputValue) => void;
  defaultCountry?: PhoneInputCountry;
  countries?: PhoneInputCountry[];
  labels?: Labels;
  locales?: string | string[];
  countryOptionsOrder?: CountryOptionOrder[];
  onCountryChange?: (country?: PhoneInputCountry) => void;
  countryCallingCodeEditable?: boolean;
  addInternationalOption?: boolean;
  countrySearchPlaceholder?: string;
  countryEmptyMessage?: string;
  "data-invalid"?: boolean | string;
  style?: CSSProperties & PhoneInputKnobStyle;
};

type CountrySelectOption = {
  value?: PhoneInputCountry;
  label: string;
};

type PhoneCountrySelectProps = {
  value?: PhoneInputCountry;
  options: CountrySelectOption[];
  onChange: (country?: PhoneInputCountry) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  "aria-label"?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  knobStyle?: CSSProperties & PhoneInputKnobStyle;
};

type PhoneInputControlProps = ComponentProps<"input"> & {
  normalizationCountry?: PhoneInputCountry;
  onNativeChange?: ChangeEventHandler<HTMLInputElement>;
};

// country-flag-icons spreads full SVG props while react-phone-number-input declares ({ title }) => Element;
// intersecting both keeps `title` required, so no widening assertion is needed.
type FlagComponent = ComponentType<SVGProps<SVGSVGElement> & EmbeddedFlagProps>;
const FLAG_COMPONENTS: Partial<Record<PhoneInputCountry, FlagComponent>> = flags;
const PhoneNumberInputWithRef: ComponentType<ComponentProps<typeof PhoneNumberInput> & { inputRef?: Ref<HTMLInputElement> }> =
  PhoneNumberInput;

function PhoneInputContainer({ className, ...props }: ComponentProps<typeof InputGroup>) {
  return <InputGroup data-field-kind="phone-input" className={cn("gap-0 p-0", className)} {...props} />;
}

function PhoneInputControl({ className, normalizationCountry, onChange, onNativeChange, ...props }: PhoneInputControlProps) {
  return (
    <InputGroupInput
      {...props}
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="phone-input"
      data-slot="input"
      dir="ltr"
      className={cn("px-3", className)}
      onChange={(event) => {
        const normalizedText = normalizePhoneInputText(event.currentTarget.value, normalizationCountry);
        if (normalizedText !== event.currentTarget.value) event.currentTarget.value = normalizedText;
        onChange?.(event);
        onNativeChange?.(event);
      }}
    />
  );
}

function PhoneCountrySelect({
  value,
  options,
  onChange,
  onFocus,
  onBlur,
  disabled,
  readOnly,
  "aria-label": ariaLabel = "Country",
  searchPlaceholder = "Search country...",
  emptyMessage = "No country found.",
  knobStyle,
}: PhoneCountrySelectProps) {
  const countryStyle = knobStyle;
  const triggerStyle = knobStyle;
  const metadataStyle = knobStyle;
  const chevronStyle = knobStyle;
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const selectedCallingCode = value ? `+${getCountryCallingCode(value)}` : undefined;
  const accessibleLabel = selectedOption
    ? `${ariaLabel}: ${selectedOption.label}${selectedCallingCode ? ` (${selectedCallingCode})` : ""}`
    : ariaLabel;

  return (
    <InputGroupAddon data-phone-input-country="" className="h-full self-stretch p-0" style={countryStyle}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          data-control-ui="phone-input"
          data-control-family="phone-input"
          data-slot="country-trigger"
          render={<button type="button" />}
          disabled={disabled || readOnly}
          aria-label={accessibleLabel}
          onFocus={onFocus}
          onBlur={onBlur}
          className="inline-flex h-full min-w-14 items-center justify-center gap-2 px-3 disabled:cursor-not-allowed"
          style={triggerStyle}
        >
          <CountryFlag country={value} />
          <ChevronIcon open={open} style={chevronStyle} />
        </PopoverTrigger>
        <PopoverContent align="start" padding="none" className="w-[min(20rem,calc(100vw-2rem))]">
          <Command>
            <CommandInput aria-label={searchPlaceholder} placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const callingCode = option.value ? `+${getCountryCallingCode(option.value)}` : "";
                  const selected = option.value === value;

                  return (
                    <CommandItem
                      key={option.value ?? "international"}
                      value={`${option.label} ${option.value ?? "international"} ${callingCode}`}
                      data-current={selected ? "" : undefined}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <CountryFlag country={option.value} />
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {callingCode ? (
                        <span
                          data-control-ui="phone-input"
                          data-control-family="phone-input"
                          data-slot="metadata"
                          className="min-w-0"
                          style={metadataStyle}
                        >
                          {callingCode}
                        </span>
                      ) : null}
                      {selected ? <span className="sr-only">Selected</span> : null}
                      <CheckIcon visible={selected} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </InputGroupAddon>
  );
}

function CountryFlag({ country }: { country?: PhoneInputCountry }) {
  if (!country) return <GlobeIcon />;
  const Flag = FLAG_COMPONENTS[country];
  // empty title renders no <title>, keeping flag decorative beside country name
  return Flag ? (
    <Flag
      title=""
      aria-hidden="true"
      data-control-ui="phone-input"
      data-control-family="phone-input"
      data-slot="flag"
      className="h-3.5 w-5 shrink-0"
    />
  ) : (
    <span data-control-ui="phone-input" data-control-family="phone-input" data-slot="country-code">
      {country}
    </span>
  );
}

function PhoneFlag({ country }: { country: PhoneInputCountry; countryName: string }) {
  return <CountryFlag country={country} />;
}

export function PhoneInput(props: PhoneInputProps) {
  const controlled = Object.hasOwn(props, "value");
  const {
    ref,
    size = "md",
    value,
    defaultValue,
    onValueChange,
    onChange: onNativeChange,
    name,
    disabled,
    readOnly,
    className,
    style,
    defaultCountry,
    countries,
    labels,
    locales,
    countryOptionsOrder,
    onCountryChange,
    countryCallingCodeEditable = true,
    addInternationalOption = true,
    countrySearchPlaceholder,
    countryEmptyMessage,
    "aria-invalid": ariaInvalid,
    "data-invalid": dataInvalid,
    ...inputProps
  } = props;
  const knobStyle = style;
  const [internalValue, setInternalValue] = useState<PhoneInputValue | string | undefined>(defaultValue);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const currentValue = controlled ? value : internalValue;

  function handleValueChange(nextValue?: PhoneInputValue) {
    const normalizationCountry = selectedCountry ?? (nextValue ? parsePhoneNumber(nextValue)?.country : undefined);
    const normalizedValue = normalizePhoneInputValue(nextValue, normalizationCountry);
    if (!controlled) setInternalValue(normalizedValue);
    onValueChange?.(normalizedValue);
  }

  function handleCountryChange(country?: PhoneInputCountry) {
    setSelectedCountry(country);
    onCountryChange?.(country);
  }

  return (
    <>
      <PhoneNumberInputWithRef
        {...inputProps}
        inputRef={ref}
        value={currentValue}
        onChange={handleValueChange}
        name={undefined}
        className={className}
        style={style}
        disabled={disabled}
        readOnly={readOnly}
        defaultCountry={defaultCountry}
        countries={countries}
        labels={labels}
        locales={locales}
        countryOptionsOrder={countryOptionsOrder}
        onCountryChange={handleCountryChange}
        international
        countryCallingCodeEditable={countryCallingCodeEditable}
        addInternationalOption={addInternationalOption}
        autoComplete={inputProps.autoComplete ?? "tel"}
        containerComponent={PhoneInputContainer}
        containerComponentProps={{
          size,
          "aria-invalid": ariaInvalid,
          "data-invalid": dataInvalid,
          "data-disabled": disabled ? "true" : undefined,
        }}
        inputComponent={PhoneInputControl}
        numberInputProps={{
          normalizationCountry: selectedCountry,
          onNativeChange,
          "aria-invalid": ariaInvalid,
          "data-invalid": dataInvalid,
        }}
        countrySelectComponent={PhoneCountrySelect}
        countrySelectProps={{
          searchPlaceholder: countrySearchPlaceholder,
          emptyMessage: countryEmptyMessage,
          knobStyle,
        }}
        flagComponent={PhoneFlag}
      />
      {name && currentValue ? <input type="hidden" name={name} value={currentValue} disabled={disabled} /> : null}
    </>
  );
}

function ChevronIcon({ open, style }: { open: boolean; style?: CSSProperties & PhoneInputKnobStyle }) {
  return (
    <svg
      data-control-ui="phone-input"
      data-control-family="phone-input"
      data-slot="chevron"
      viewBox="0 0 12 12"
      data-open={open ? "true" : undefined}
      className="size-3"
      style={style}
      aria-hidden="true"
      fill="none"
    >
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ visible }: { visible: boolean }) {
  return (
    <span
      data-control-ui="phone-input"
      data-control-family="phone-input"
      data-slot="check"
      data-visible={visible || undefined}
      className="flex size-3.5 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
        <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function GlobeIcon() {
  return (
    <svg
      data-control-ui="phone-input"
      data-control-family="phone-input"
      data-slot="flag"
      viewBox="0 0 16 16"
      className="size-4 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2.75 8h10.5M8 2.5c1.45 1.5 2.15 3.34 2.15 5.5S9.45 12 8 13.5C6.55 12 5.85 10.16 5.85 8S6.55 4 8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
