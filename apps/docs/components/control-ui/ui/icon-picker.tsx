"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import type { ControlledChoice } from "@/components/control-ui/control-props";
import type { IconPickerKnobStyle } from "@/components/control-ui/knob-contracts/icon-picker-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Input } from "@/components/control-ui/ui/input";

export type IconPickerItem = { value: string; label: string; icon: ReactNode; keywords?: readonly string[] };
export type IconPickerColor = { value: string; label: string; color: string };
type IconPickerStyle = { style?: CSSProperties & IconPickerKnobStyle };
type IconPickerContextValue = {
  items: readonly IconPickerItem[];
  columns: number;
  selectedValue: string | undefined;
  selectIcon: (value: string) => void;
  search: string;
  setSearch: (search: string) => void;
};

const IconPickerContext = createContext<IconPickerContextValue | null>(null);

function useIconPicker() {
  const picker = useContext(IconPickerContext);
  if (!picker) throw new Error("IconPicker parts must be rendered inside <IconPicker>.");
  return picker;
}

export type IconPickerProps = Omit<ComponentProps<"div">, "style" | "defaultValue" | "onChange"> &
  IconPickerStyle &
  ControlledChoice & {
    items: readonly IconPickerItem[];
    columns?: number;
  };

export function IconPicker({
  items,
  columns = 8,
  value,
  defaultValue,
  onValueChange,
  className,
  style,
  children,
  ...props
}: IconPickerProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [search, setSearch] = useState("");
  const selectIcon = (selectedValue: string) => {
    if (value === undefined) setUncontrolledValue(selectedValue);
    onValueChange?.(selectedValue);
  };
  const pickerStyle = { "--_icon-picker-columns": columns, ...style } satisfies CSSProperties & { "--_icon-picker-columns": number };

  return (
    <IconPickerContext.Provider value={{ items, columns, selectedValue: value ?? uncontrolledValue, selectIcon, search, setSearch }}>
      <div
        data-control-ui="icon-picker"
        data-control-family="icon-picker"
        data-slot="root"
        className={className}
        style={pickerStyle}
        {...props}
      >
        {children}
      </div>
    </IconPickerContext.Provider>
  );
}

export type IconPickerSearchProps = Omit<ComponentProps<typeof Input>, "value" | "defaultValue" | "onValueChange">;

export function IconPickerSearch({
  placeholder = "Search icons…",
  "aria-label": ariaLabel = "Search icons",
  className,
  onChange,
  ...props
}: IconPickerSearchProps) {
  const picker = useIconPicker();
  return (
    <Input
      type="search"
      size="sm"
      placeholder={placeholder}
      aria-label={ariaLabel}
      autoComplete="off"
      spellCheck={false}
      className={cn("mx-2 mt-2 w-[calc(100%-var(--spacing)*4)]", className)}
      {...props}
      value={picker.search}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) picker.setSearch(event.target.value);
      }}
    />
  );
}

export type IconPickerContentProps = Omit<ComponentProps<"div">, "style" | "children"> & IconPickerStyle & { empty?: ReactNode };

export function IconPickerContent({
  className,
  empty = "No icons found.",
  "aria-label": ariaLabel = "Icons",
  ...props
}: IconPickerContentProps) {
  const picker = useIconPicker();
  const buttonsRef = useRef(new Map<string, HTMLButtonElement>());
  const normalizedSearch = picker.search.trim().toLocaleLowerCase();
  const filteredItems = picker.items.filter((item) =>
    [item.label, ...(item.keywords ?? [])].some((text) => text.toLocaleLowerCase().includes(normalizedSearch)),
  );

  const moveGridFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    const currentIndex = filteredItems.findIndex((item) => buttonsRef.current.get(item.value) === event.target);
    if (currentIndex < 0) return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = Math.max(0, Math.min(filteredItems.length - 1, currentIndex + direction * picker.columns));
    buttonsRef.current.get(filteredItems[nextIndex].value)?.focus();
  };

  return (
    <div data-control-ui="icon-picker" data-control-family="icon-picker" data-slot="content" className={className} {...props}>
      {filteredItems.length === 0 ? (
        <div data-control-ui="icon-picker" data-control-family="icon-picker" data-slot="empty" role="status">
          {empty}
        </div>
      ) : (
        <ToolbarPrimitive.Root
          data-control-ui="icon-picker"
          data-control-family="icon-picker"
          data-slot="grid"
          aria-label={ariaLabel}
          loopFocus={false}
          onKeyDownCapture={moveGridFocus}
        >
          {filteredItems.map((item) => (
            <ToolbarPrimitive.Button
              key={item.value}
              type="button"
              aria-label={item.label}
              aria-pressed={picker.selectedValue === item.value}
              data-control-ui="icon-picker"
              data-control-family="icon-picker"
              data-slot="icon"
              ref={(button) => {
                if (!button) return;
                buttonsRef.current.set(item.value, button);
                return () => {
                  buttonsRef.current.delete(item.value);
                };
              }}
              onClick={() => picker.selectIcon(item.value)}
            >
              <span aria-hidden="true">{item.icon}</span>
            </ToolbarPrimitive.Button>
          ))}
        </ToolbarPrimitive.Root>
      )}
    </div>
  );
}

export type IconPickerColorsProps = Omit<ComponentProps<"div">, "style" | "defaultValue" | "onChange" | "children"> &
  IconPickerStyle &
  ControlledChoice & {
    colors: readonly IconPickerColor[];
  };

export function IconPickerColors({ colors, "aria-label": ariaLabel = "Icon color", ...props }: IconPickerColorsProps) {
  return (
    <RadioGroupPrimitive
      data-control-ui="icon-picker"
      data-control-family="icon-picker"
      data-slot="colors"
      aria-label={ariaLabel}
      {...props}
    >
      {colors.map((color) => (
        <RadioPrimitive.Root
          key={color.value}
          value={color.value}
          aria-label={color.label}
          data-control-ui="icon-picker"
          data-control-family="icon-picker"
          data-slot="color"
          style={{ color: color.color }}
        >
          <span aria-hidden="true" />
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  );
}
