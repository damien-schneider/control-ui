"use client";

import type { ChangeEventHandler, ComponentProps, ComponentType, Ref, SVGProps } from "react";
import { useState } from "react";
import type { Labels } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import PhoneNumberInput, { type Country, getCountryCallingCode, parsePhoneNumber, type Value } from "react-phone-number-input/max";

import type { ControlSize } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { normalizePhoneInputText, normalizePhoneInputValue } from "@/components/control-ui/lib/phone-input-format";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/control-ui/ui/command";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/control-ui/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/control-ui/ui/popover";

export type PhoneInputValue = Value;
export type PhoneInputCountry = Country;

type CountryOptionOrder = PhoneInputCountry | "XX" | "🌐" | "|" | "..." | "…";

export type PhoneInputProps = Omit<ComponentProps<"input">, "defaultValue" | "size" | "type" | "value"> & {
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
};

type PhoneInputControlProps = ComponentProps<"input"> & {
  normalizationCountry?: PhoneInputCountry;
  onNativeChange?: ChangeEventHandler<HTMLInputElement>;
};

type FlagComponent = ComponentType<SVGProps<SVGSVGElement>>;
// The bundled country-flag-icons components accept full SVG props, but react-phone-number-input declares them as ({ title }) => Element.
const FLAG_COMPONENTS = flags as Partial<Record<PhoneInputCountry, FlagComponent>>;
const PhoneNumberInputWithRef: ComponentType<ComponentProps<typeof PhoneNumberInput> & { inputRef?: Ref<HTMLInputElement> }> =
  PhoneNumberInput;

function PhoneInputContainer({ className, ...props }: ComponentProps<typeof InputGroup>) {
  return <InputGroup data-phone-input="" className={cn("gap-0 p-0", className)} {...props} />;
}

function PhoneInputControl({ className, normalizationCountry, onChange, onNativeChange, ...props }: PhoneInputControlProps) {
  return (
    <InputGroupInput
      data-phone-input-control=""
      dir="ltr"
      className={cn("px-3 tabular-nums", className)}
      onChange={(event) => {
        const normalizedText = normalizePhoneInputText(event.currentTarget.value, normalizationCountry);
        if (normalizedText !== event.currentTarget.value) event.currentTarget.value = normalizedText;
        onChange?.(event);
        onNativeChange?.(event);
      }}
      {...props}
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
}: PhoneCountrySelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const selectedCallingCode = value ? `+${getCountryCallingCode(value)}` : undefined;
  const accessibleLabel = selectedOption
    ? `${ariaLabel}: ${selectedOption.label}${selectedCallingCode ? ` (${selectedCallingCode})` : ""}`
    : ariaLabel;

  return (
    <InputGroupAddon data-phone-input-country="" className="h-full self-stretch border-e border-border p-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<button type="button" />}
          disabled={disabled || readOnly}
          aria-label={accessibleLabel}
          onFocus={onFocus}
          onBlur={onBlur}
          className="inline-flex h-full min-w-14 items-center justify-center gap-2 px-3 outline-none transition-colors hover:bg-foreground/6 focus-visible:bg-foreground/6 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CountryFlag country={value} />
          <ChevronIcon open={open} />
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
                      {callingCode ? <span className="text-meta tabular-nums text-muted-foreground">{callingCode}</span> : null}
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
  return Flag ? <Flag aria-hidden="true" className="h-3.5 w-5 shrink-0 rounded-[2px]" /> : <span className="text-meta">{country}</span>;
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
        }}
        flagComponent={PhoneFlag}
      />
      {name && currentValue ? <input type="hidden" name={name} value={currentValue} disabled={disabled} /> : null}
    </>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={cn(
        "size-3 text-muted-foreground transition-transform duration-[var(--duration-base)] ease-[var(--ease-emphasized)]",
        open && "rotate-180",
      )}
      aria-hidden="true"
      fill="none"
    >
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ visible }: { visible: boolean }) {
  return (
    <span className={cn("flex size-3.5 shrink-0 items-center justify-center", !visible && "opacity-0")} aria-hidden="true">
      <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
        <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2.75 8h10.5M8 2.5c1.45 1.5 2.15 3.34 2.15 5.5S9.45 12 8 13.5C6.55 12 5.85 10.16 5.85 8S6.55 4 8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
