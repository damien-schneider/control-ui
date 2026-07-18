"use client";

import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { Calendar } from "@/components/control-ui/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/control-ui/ui/popover";

export function PrimitiveDatePickerExample() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">Date</span>
      <Popover>
        <PopoverTrigger
          render={<Button variant="surface" tone="neutral" />}
          className="w-56 justify-start font-normal data-[placeholder]:text-muted-foreground"
          data-placeholder={date ? undefined : ""}
        >
          {date ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date) : "Pick a date"}
        </PopoverTrigger>
        <PopoverContent align="start" padding="none" className="w-auto">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
