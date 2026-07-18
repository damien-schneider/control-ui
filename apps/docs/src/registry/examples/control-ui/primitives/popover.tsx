"use client";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/control-ui/ui/popover";

const triggerClass =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--radius-control)] bg-card px-4 text-sm font-medium text-foreground shadow-sm ring-1 ring-inset ring-border transition hover:bg-foreground/5";

export function PrimitivePopoverExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Popover>
        <PopoverTrigger className={triggerClass}>Dimensions</PopoverTrigger>
        <PopoverContent align="start">
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the width and height for the layer.</PopoverDescription>
          </PopoverHeader>
          <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
            <label htmlFor="popover-width" className="text-muted-foreground">
              Width
            </label>
            <input
              id="popover-width"
              defaultValue="320px"
              className="h-8 w-24 rounded-[var(--radius-control)] bg-background px-2 text-right outline-none ring-1 ring-inset ring-border focus-visible:ring-2 focus-visible:ring-foreground/20"
            />
            <label htmlFor="popover-height" className="text-muted-foreground">
              Height
            </label>
            <input
              id="popover-height"
              defaultValue="180px"
              className="h-8 w-24 rounded-[var(--radius-control)] bg-background px-2 text-right outline-none ring-1 ring-inset ring-border focus-visible:ring-2 focus-visible:ring-foreground/20"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
