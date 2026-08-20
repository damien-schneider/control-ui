"use client";

import { type ComponentProps, type CSSProperties, useEffect, useRef } from "react";
import {
  CaptionLabel as CaptionLabelBase,
  type ChevronProps,
  Day as DayBase,
  type DayButtonProps,
  DayPicker,
  Month as MonthBase,
  MonthCaption as MonthCaptionBase,
  MonthGrid as MonthGridBase,
  Months as MonthsBase,
  Nav as NavBase,
  Weekday as WeekdayBase,
} from "react-day-picker";
import type { CalendarKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";

// react-day-picker v10 — Base UI ships no calendar, so this is one primitive reaching outside it.
// CalendarProps stays here rather than contracts.ts, which every component installs, so plain Button install never pulls this import.
type CalendarPropsWithStyle<Props> = Props extends unknown ? Omit<Props, "style"> & { style?: CSSProperties & CalendarKnobStyle } : never;

export type CalendarProps = CalendarPropsWithStyle<ComponentProps<typeof DayPicker>>;

const dayButtonClasses = "flex h-9 w-full min-w-9 items-center justify-center disabled:pointer-events-none";

const navButtonClasses = "inline-flex size-8 items-center justify-center disabled:pointer-events-none";

const chevronPathByOrientation = {
  left: "M10 3 5.5 8 10 13",
  right: "M6 3 10.5 8 6 13",
  up: "M3 10 8 5.5 13 10",
  down: "M3 6 8 10.5 13 6",
} satisfies Record<NonNullable<ChevronProps["orientation"]>, string>;

export function Calendar({ className, showOutsideDays = true, style, ...props }: CalendarProps) {
  return (
    <div data-control-ui="calendar" data-control-family="calendar" data-slot="root" className={cn("w-fit p-3", className)} style={style}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        components={{
          Chevron: CalendarChevron,
          Months: CalendarMonths,
          Month: CalendarMonth,
          MonthCaption: CalendarMonthCaption,
          CaptionLabel: CalendarCaptionLabel,
          Nav: CalendarNav,
          PreviousMonthButton: CalendarNavButton,
          NextMonthButton: CalendarNavButton,
          MonthGrid: CalendarMonthGrid,
          Weekday: CalendarWeekday,
          Day: CalendarDay,
          DayButton: CalendarDayButton,
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
      className={cn("relative flex flex-col gap-4 sm:flex-row", className)}
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
      className={cn("flex flex-col gap-3", className)}
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
      className={cn("flex h-9 items-center justify-center", className)}
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

// matches MonthCaption row so buttons centre on month label
function CalendarNav({ className, ...props }: ComponentProps<typeof NavBase>) {
  return (
    <NavBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="nav"
      className={cn("absolute inset-x-0 top-0 flex h-9 items-center justify-between", className)}
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
      className={cn("mt-1 w-full", className)}
      {...props}
    />
  );
}

function CalendarWeekday({ className, ...props }: ComponentProps<typeof WeekdayBase>) {
  return (
    <WeekdayBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="weekday"
      className={cn("pb-1.5", className)}
      {...props}
    />
  );
}

function CalendarDay({ className, ...props }: ComponentProps<typeof DayBase>) {
  return (
    <DayBase
      data-control-ui="calendar"
      data-control-family="calendar"
      data-slot="day-cell"
      className={cn("p-0 align-middle", className)}
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
  const path = chevronPathByOrientation[orientation ?? "down"];
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
