"use client";

import { type ComponentProps, type CSSProperties, useEffect, useRef } from "react";
import {
  CaptionLabel as CaptionLabelBase,
  type ChevronProps,
  Day as DayBase,
  type DayButtonProps,
  DayPicker,
  type DropdownProps,
  Month as MonthBase,
  MonthCaption as MonthCaptionBase,
  MonthGrid as MonthGridBase,
  Months as MonthsBase,
  Nav as NavBase,
  useDayPicker,
  Weekday as WeekdayBase,
  WeekNumber as WeekNumberBase,
  WeekNumberHeader as WeekNumberHeaderBase,
} from "react-day-picker";
import type { CalendarKnobStyle } from "@/components/control-ui/knob-contracts/calendar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";

// react-day-picker v10 — Base UI ships no calendar, so this is one primitive reaching outside it.
// CalendarProps stays here rather than contracts.ts, which every component installs, so plain Button install never pulls this import.
type CalendarPropsWithStyle<Props> = Props extends unknown ? Omit<Props, "style"> & { style?: CSSProperties & CalendarKnobStyle } : never;

export type CalendarProps = CalendarPropsWithStyle<ComponentProps<typeof DayPicker>>;

const dayButtonClasses = "flex w-full items-center justify-center";

const navButtonClasses = "inline-flex items-center justify-center";

const chevronPathByOrientation = {
  left: "M10 3 5.5 8 10 13",
  right: "M6 3 10.5 8 6 13",
  up: "M3 10 8 5.5 13 10",
  down: "M3 6 8 10.5 13 6",
} satisfies Record<NonNullable<ChevronProps["orientation"]>, string>;

export function Calendar({ className, showOutsideDays, style, components, ...props }: CalendarProps) {
  const skin = useSkin();
  return (
    <div data-control-ui="calendar" data-control-family="calendar" data-slot="root" className={cn("w-fit", className)} style={style}>
      <DayPicker
        showOutsideDays={showOutsideDays ?? skin.calendarShowOutsideDays ?? true}
        components={{
          Chevron: CalendarChevron,
          Months: CalendarMonths,
          Month: CalendarMonth,
          MonthCaption: CalendarMonthCaption,
          CaptionLabel: CalendarCaptionLabel,
          DropdownNav: CalendarDropdownNav,
          Dropdown: CalendarDropdown,
          Nav: CalendarNav,
          PreviousMonthButton: CalendarNavButton,
          NextMonthButton: CalendarNavButton,
          MonthGrid: CalendarMonthGrid,
          Weekday: CalendarWeekday,
          WeekNumberHeader: CalendarWeekNumberHeader,
          WeekNumber: CalendarWeekNumber,
          Day: CalendarDay,
          DayButton: CalendarDayButton,
          ...components,
        }}
        {...props}
      />
    </div>
  );
}

// `relative` belongs here, not on Month: library renders Nav as sibling of months, so this is closest ancestor its absolute buttons can pin to
function CalendarMonths({ className, ...props }: ComponentProps<typeof MonthsBase>) {
  return (
    <MonthsBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="months"
      className={cn("relative flex flex-col sm:flex-row", className)}
      {...props}
    />
  );
}

function CalendarMonth({ className, ...props }: ComponentProps<typeof MonthBase>) {
  return (
    <MonthBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="month"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function CalendarMonthCaption({ className, ...props }: ComponentProps<typeof MonthCaptionBase>) {
  return (
    <MonthCaptionBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="month-caption"
      className={cn("flex items-center justify-center", className)}
      {...props}
    />
  );
}

function CalendarCaptionLabel({ className, ...props }: ComponentProps<typeof CaptionLabelBase>) {
  return (
    <CaptionLabelBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="caption-label"
      className={cn("select-none", className)}
      {...props}
    />
  );
}

function CalendarDropdownNav({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="dropdowns"
      className={cn("inline-flex items-center", className)}
      {...props}
    />
  );
}

// the native select stays the control (keyboard, screen reader, mobile picker); it sits transparent over a label the recipe can paint
function CalendarDropdown({ options, className, ...selectProps }: DropdownProps) {
  const { components } = useDayPicker();
  const selectedOption = options?.find((option) => option.value === selectProps.value);
  return (
    <span
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="dropdown"
      data-focus-ring="within"
      data-disabled={selectProps.disabled ? "true" : undefined}
      className="relative inline-flex items-center"
    >
      <components.Select
        data-control-ui="calendar"
        data-control-family="calendar"
        data-slot="dropdown-select"
        className={cn("absolute start-0 top-1/2 w-full -translate-y-1/2 appearance-none opacity-0", className)}
        {...selectProps}
      >
        {options?.map((option) => (
          <components.Option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </components.Option>
        ))}
      </components.Select>
      <span
        data-control-ui="calendar"
        data-control-family="calendar"
        data-slot="dropdown-label"
        aria-hidden="true"
        className="inline-flex items-center"
      >
        {selectedOption?.label}
        <components.Chevron orientation="down" />
      </span>
    </span>
  );
}

// matches MonthCaption row so buttons centre on month label
function CalendarNav({ className, ...props }: ComponentProps<typeof NavBase>) {
  return (
    <NavBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="nav"
      className={cn("absolute inset-x-0 top-0 flex items-center justify-between", className)}
      {...props}
    />
  );
}

function CalendarNavButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="nav-button"
      className={cn(navButtonClasses, className)}
      {...props}
    />
  );
}

function CalendarMonthGrid({ className, ...props }: ComponentProps<typeof MonthGridBase>) {
  return (
    <MonthGridBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="month-grid"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

function CalendarWeekday({ className, ...props }: ComponentProps<typeof WeekdayBase>) {
  return <WeekdayBase data-control-ui="calendar" data-control-family="calendar" data-slot="weekday" className={cn(className)} {...props} />;
}

function CalendarWeekNumberHeader({ className, ...props }: ComponentProps<typeof WeekNumberHeaderBase>) {
  return (
    <WeekNumberHeaderBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="week-number-header"
      className={className}
      {...props}
    />
  );
}

function CalendarWeekNumber({ className, ...props }: ComponentProps<typeof WeekNumberBase>) {
  return (
    <WeekNumberBase data-control-ui="calendar" data-control-family="calendar" data-slot="week-number" className={className} {...props} />
  );
}

function CalendarDay({ className, day, ...props }: ComponentProps<typeof DayBase>) {
  const dayOfWeek = day.date.getDay();
  return (
    <DayBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="day-cell"
      data-weekend={dayOfWeek === 0 || dayOfWeek === 6 ? true : undefined}
      className={cn("align-middle", className)}
      day={day}
      {...props}
    />
  );
}

function CalendarDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  // one-click range marks same day as both ends, which would flatten both sides and drop --radius-control entirely
  const isSingleDayRange = Boolean(modifiers.range_start && modifiers.range_end);
  const isRange = !isSingleDayRange && (modifiers.range_start || modifiers.range_middle || modifiers.range_end);
  return (
    <button
      ref={ref}
      type="button"
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="day"
      data-today={modifiers.today ? true : undefined}
      data-selected-single={modifiers.selected && !isRange ? true : undefined}
      data-range-start={modifiers.range_start && !isSingleDayRange ? true : undefined}
      data-range-middle={modifiers.range_middle ? true : undefined}
      data-range-end={modifiers.range_end && !isSingleDayRange ? true : undefined}
      className={cn(dayButtonClasses, className)}
      {...props}
    />
  );
}

function CalendarChevron({ className, orientation }: ChevronProps) {
  const { dayPickerProps } = useDayPicker();
  const path = chevronPathByOrientation[orientation ?? "down"];
  // the library swaps the previous/next chevrons only for navLayout="around" with an explicit dir prop; every other RTL case mirrors in CSS
  const librarySwaps = dayPickerProps.navLayout === "around" && dayPickerProps.dir === "rtl";
  const mirrorsInRtl = (orientation === "left" || orientation === "right") && !librarySwaps;
  return (
    <svg
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="chevron"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-icon-dir={mirrorsInRtl ? "inline" : undefined}
    >
      <path d={path} />
    </svg>
  );
}
