"use client";

import { type ComponentProps, useEffect, useRef } from "react";
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
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// react-day-picker v10 — Base UI ships no calendar, so this is the one primitive reaching outside it.
// Compose-parts contract: each part wraps the library's default, applying token classes via className only.
// CalendarProps lives here not contracts.ts (installed by every component) to avoid forcing this import on non-calendar installs.
export type CalendarProps = ComponentProps<typeof DayPicker>;

const dayButtonClasses =
  "flex h-9 w-full min-w-9 items-center justify-center rounded-[var(--radius-control)] text-sm font-normal leading-none text-foreground outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:pointer-events-none disabled:opacity-40 data-[today=true]:bg-accent data-[today=true]:font-medium data-[today=true]:text-accent-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:hover:bg-primary data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-r-none data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:rounded-l-none data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground";

const navButtonClasses =
  "inline-flex size-8 items-center justify-center rounded-[var(--radius-control)] text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:pointer-events-none disabled:opacity-40";

const chevronPathByOrientation = {
  left: "M10 3 5.5 8 10 13",
  right: "M6 3 10.5 8 6 13",
  up: "M3 10 8 5.5 13 10",
  down: "M3 6 8 10.5 13 6",
} satisfies Record<NonNullable<ChevronProps["orientation"]>, string>;

export function Calendar({ className, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <div data-control-ui="calendar" data-slot="root" className={cn("w-fit p-3", skinSlot("calendar", "root", {}), className)}>
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

function CalendarMonths({ className, ...props }: ComponentProps<typeof MonthsBase>) {
  return <MonthsBase className={cn("flex flex-col gap-4 sm:flex-row", className)} {...props} />;
}

// `relative` so the absolutely-positioned Nav pins its buttons to the month's top corners.
function CalendarMonth({ className, ...props }: ComponentProps<typeof MonthBase>) {
  return <MonthBase className={cn("relative flex flex-col gap-3", className)} {...props} />;
}

function CalendarMonthCaption({ className, ...props }: ComponentProps<typeof MonthCaptionBase>) {
  return <MonthCaptionBase className={cn("flex h-9 items-center justify-center", className)} {...props} />;
}

function CalendarCaptionLabel({ className, ...props }: ComponentProps<typeof CaptionLabelBase>) {
  return <CaptionLabelBase className={cn("select-none text-sm font-medium", className)} {...props} />;
}

function CalendarNav({ className, ...props }: ComponentProps<typeof NavBase>) {
  return <NavBase className={cn("absolute inset-x-0 top-0 flex items-center justify-between", className)} {...props} />;
}

function CalendarNavButton({ className, ...props }: ComponentProps<"button">) {
  return <button className={cn(navButtonClasses, className)} {...props} />;
}

function CalendarMonthGrid({ className, ...props }: ComponentProps<typeof MonthGridBase>) {
  return <MonthGridBase className={cn("mt-1 w-full border-collapse", className)} {...props} />;
}

function CalendarWeekday({ className, ...props }: ComponentProps<typeof WeekdayBase>) {
  return <WeekdayBase className={cn("pb-1.5 text-[0.72rem] font-normal text-muted-foreground", className)} {...props} />;
}

function CalendarDay({ className, ...props }: ComponentProps<typeof DayBase>) {
  return <DayBase className={cn("p-0 text-center align-middle", className)} {...props} />;
}

// Library modifiers resolved into data-* the recipe styles; library's focus-on-mount behavior preserved.
function CalendarDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  const isRange = modifiers.range_start || modifiers.range_middle || modifiers.range_end;
  return (
    <button
      ref={ref}
      type="button"
      data-control-ui="calendar"
      data-slot="day"
      data-today={modifiers.today ? true : undefined}
      data-selected-single={modifiers.selected && !isRange ? true : undefined}
      data-range-start={modifiers.range_start ? true : undefined}
      data-range-middle={modifiers.range_middle ? true : undefined}
      data-range-end={modifiers.range_end ? true : undefined}
      className={cn(dayButtonClasses, skinSlot("calendar", "day", {}), className)}
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
