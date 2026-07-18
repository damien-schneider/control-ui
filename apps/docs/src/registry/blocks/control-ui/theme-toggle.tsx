"use client";

import { CheckIcon, ChevronDownIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import type { ComponentProps, ComponentType, CSSProperties } from "react";
import { useId } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/components/control-ui/ui/menu";
import { Switch } from "@/components/control-ui/ui/switch";

export type ThemeMode = "light" | "dark" | "system";

export type ThemeToggleOption = {
  value: ThemeMode;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  disabled?: boolean;
};

type ThemeControlProps = {
  value: ThemeMode;
  onValueChange: (value: ThemeMode) => void;
  options?: readonly ThemeToggleOption[];
};

export type ThemeToggleProps = Omit<ComponentProps<typeof Button>, "value" | "onChange"> &
  ThemeControlProps & {
    showLabel?: boolean;
    showLabels?: boolean;
  };

export type ThemeSwitchProps = Omit<ComponentProps<typeof Switch>, "checked" | "defaultChecked" | "onCheckedChange" | "value"> & {
  value: ThemeMode;
  onValueChange: (value: ThemeMode) => void;
  onValue?: ThemeMode;
  offValue?: ThemeMode;
};

export type ThemeSegmentedSwitchProps = Omit<ComponentProps<"div">, "onChange"> &
  ThemeControlProps & {
    name?: string;
    showLabels?: boolean;
  };

export type ThemeDropdownProps = Omit<ComponentProps<typeof MenuTrigger>, "children" | "value" | "onChange"> &
  ThemeControlProps & {
    label?: string;
  };

const defaultThemeOptions: readonly ThemeToggleOption[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

const defaultSwitchCheckedIcon = <MoonIcon />;
const defaultSwitchUncheckedIcon = <SunIcon />;

function classes(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function enabledOptions(options: readonly ThemeToggleOption[]) {
  return options.filter((option) => !option.disabled);
}

function controlOptions(options: readonly ThemeToggleOption[]) {
  return options.length > 0 ? options : defaultThemeOptions;
}

function currentThemeOption(value: ThemeMode, options: readonly ThemeToggleOption[]) {
  return (
    options.find((option) => option.value === value) ??
    defaultThemeOptions.find((option) => option.value === value) ??
    defaultThemeOptions[2]
  );
}

function effectiveThemeValue(value: ThemeMode, options: readonly ThemeToggleOption[]) {
  if (options.some((option) => option.value === value)) return value;
  return enabledOptions(options)[0]?.value ?? options[0]?.value ?? "system";
}

function nextThemeValue(value: ThemeMode, options: readonly ThemeToggleOption[]) {
  const available = enabledOptions(options);
  if (available.length === 0) return value;

  const currentIndex = available.findIndex((option) => option.value === value);
  return available[(currentIndex + 1) % available.length]?.value ?? available[0].value;
}

export function ThemeSwitch({
  value,
  onValueChange,
  onValue = "dark",
  offValue = "light",
  checkedIcon,
  uncheckedIcon,
  "aria-label": ariaLabel,
  ...props
}: ThemeSwitchProps) {
  return (
    <Switch
      checked={value === onValue}
      checkedIcon={checkedIcon ?? defaultSwitchCheckedIcon}
      uncheckedIcon={uncheckedIcon ?? defaultSwitchUncheckedIcon}
      onCheckedChange={(checked) => onValueChange(checked ? onValue : offValue)}
      aria-label={ariaLabel ?? "Dark mode"}
      {...props}
    />
  );
}

export function ThemeSegmentedSwitch({
  value,
  onValueChange,
  options = defaultThemeOptions,
  showLabels = false,
  name,
  className,
  style,
  "aria-label": ariaLabel = "Theme",
  ...props
}: ThemeSegmentedSwitchProps) {
  const generatedName = useId();
  const choices = controlOptions(options);
  const currentValue = effectiveThemeValue(value, choices);
  const activeIndex = Math.max(
    0,
    choices.findIndex((option) => option.value === currentValue),
  );
  const indicatorStyle = {
    width: `calc((100% - 0.25rem) / ${choices.length})`,
    transform: `translateX(${activeIndex * 100}%)`,
  } satisfies CSSProperties;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={classes(
        "relative isolate inline-flex h-7 w-fit shrink-0 rounded-full border border-border bg-foreground/8 p-0.5 text-muted-foreground shadow-inner",
        className,
      )}
      style={style}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-full bg-background shadow-sm transition-transform duration-[var(--duration-base)] ease-[var(--ease-emphasized)]"
        style={indicatorStyle}
      />
      {choices.map((option) => {
        const selected = option.value === currentValue;
        const Icon = option.icon;

        return (
          <label
            key={option.value}
            data-selected={selected ? "true" : undefined}
            data-disabled={option.disabled ? "true" : undefined}
            className={classes(
              "relative z-[1] inline-flex h-6 cursor-pointer items-center justify-center gap-1.5 rounded-full px-1.5 text-xs font-medium outline-none transition-[color,scale] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foreground/25 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-45 data-[selected=true]:text-foreground active:scale-95",
              showLabels ? "min-w-20" : "w-7",
            )}
          >
            <input
              type="radio"
              name={name ?? generatedName}
              value={option.value}
              checked={selected}
              disabled={option.disabled}
              aria-label={option.label}
              className="sr-only"
              onChange={(event) => {
                if (event.currentTarget.checked) onValueChange(option.value);
              }}
            />
            <Icon className="size-3.5" aria-hidden />
            {showLabels ? <span>{option.label}</span> : null}
          </label>
        );
      })}
    </div>
  );
}

export function ThemeToggle({
  value,
  onValueChange,
  options = defaultThemeOptions,
  showLabel,
  showLabels,
  className,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: ThemeToggleProps) {
  const current = currentThemeOption(value, options);
  const Icon = current.icon;
  const visibleLabel = showLabel ?? showLabels ?? false;

  return (
    <Button
      variant="surface"
      size="sm"
      className={classes("gap-2", className)}
      aria-label={ariaLabel ?? `Theme: ${current.label}`}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onValueChange(nextThemeValue(value, options));
      }}
      {...props}
    >
      <Icon className="size-3.5" aria-hidden />
      {visibleLabel ? <span>{current.label}</span> : null}
    </Button>
  );
}

export function ThemeDropdown({
  value,
  onValueChange,
  options = defaultThemeOptions,
  label = "Theme",
  className,
  "aria-label": ariaLabel,
  ...props
}: ThemeDropdownProps) {
  const current = currentThemeOption(value, options);
  const CurrentIcon = current.icon;

  return (
    <Menu>
      <MenuTrigger aria-label={ariaLabel ?? label} className={classes("min-w-36 gap-2", className)} {...props}>
        <CurrentIcon className="size-3.5" aria-hidden />
        <span className="min-w-0 truncate">{current.label}</span>
        <ChevronDownIcon className="size-3 text-muted-foreground" aria-hidden />
      </MenuTrigger>
      <MenuContent className="min-w-40">
        <MenuLabel>{label}</MenuLabel>
        {options.map((option) => {
          const selected = option.value === value;
          const Icon = option.icon;

          return (
            <MenuItem key={option.value} disabled={option.disabled} onClick={() => onValueChange(option.value)}>
              <Icon className="size-3.5" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {selected ? <CheckIcon className="size-3.5" aria-hidden /> : <span className="size-3.5" aria-hidden />}
            </MenuItem>
          );
        })}
      </MenuContent>
    </Menu>
  );
}
