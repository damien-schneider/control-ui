"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/control-ui/ui/calendar";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveCalendarExample() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 6, 6));
  const [range, setRange] = useState<DateRange | undefined>({ from: new Date(2026, 6, 9), to: new Date(2026, 6, 15) });
  const [birthday, setBirthday] = useState<Date | undefined>(new Date(1994, 2, 18));

  return (
    <div className="flex flex-col flex-wrap items-center justify-center gap-8 sm:flex-row sm:items-start">
      <div className="flex flex-col gap-2">
        <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={date} />
        <Text size="caption" tone="muted" className="mx-1">
          {date ? new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date) : "No date selected"}
        </Text>
      </div>
      <div className="flex flex-col gap-2">
        <Calendar mode="range" selected={range} onSelect={setRange} defaultMonth={range?.from} />
        <Text size="caption" tone="muted" className="mx-1">
          Pick a start day, then an end day
        </Text>
      </div>
      <div className="flex flex-col gap-2">
        <Calendar
          mode="single"
          selected={birthday}
          onSelect={setBirthday}
          defaultMonth={birthday}
          captionLayout="dropdown"
          startMonth={new Date(1940, 0)}
          endMonth={new Date(2026, 11)}
          showWeekNumber
        />
        <Text size="caption" tone="muted" className="mx-1">
          Month and year dropdowns, with week numbers
        </Text>
      </div>
    </div>
  );
}
