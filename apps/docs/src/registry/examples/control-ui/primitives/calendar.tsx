"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/control-ui/ui/calendar";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveCalendarExample() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 6, 6));
  const [range, setRange] = useState<DateRange | undefined>({ from: new Date(2026, 6, 9), to: new Date(2026, 6, 15) });

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
      <div className="flex flex-col gap-2">
        <Calendar mode="single" selected={date} onSelect={setDate} />
        <Text size="caption" tone="muted" className="px-1">
          {date ? new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date) : "No date selected"}
        </Text>
      </div>
      <div className="flex flex-col gap-2">
        <Calendar mode="range" selected={range} onSelect={setRange} />
        <Text size="caption" tone="muted" className="px-1">
          Drag across days to pick a range
        </Text>
      </div>
    </div>
  );
}
