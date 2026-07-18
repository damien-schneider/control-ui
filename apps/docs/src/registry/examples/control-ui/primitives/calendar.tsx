"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/control-ui/ui/calendar";

// Calendar has no frame of its own (sits in a Popover/Card); wrapped here in a --radius-panel bordered
// surface. Day cells share --radius-control with the rest of the control family so it matches under any skin.
export function PrimitiveCalendarExample() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 6, 6));
  const [range, setRange] = useState<DateRange | undefined>({ from: new Date(2026, 6, 9), to: new Date(2026, 6, 15) });

  return (
    <div className="flex w-full flex-col items-start gap-8 sm:flex-row">
      <div className="flex flex-col gap-2">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-[var(--radius-panel)] border bg-card shadow-sm" />
        <span className="px-1 text-[11px] text-muted-foreground">
          {date ? new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date) : "No date selected"}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <Calendar mode="range" selected={range} onSelect={setRange} className="rounded-[var(--radius-panel)] border bg-card shadow-sm" />
        <span className="px-1 text-[11px] text-muted-foreground">Drag across days to pick a range</span>
      </div>
    </div>
  );
}
