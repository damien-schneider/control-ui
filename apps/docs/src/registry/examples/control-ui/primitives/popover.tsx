"use client";

import { Button } from "@/components/control-ui/ui/button";
import { Input } from "@/components/control-ui/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/control-ui/ui/popover";

export function PrimitivePopoverExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Popover>
        <PopoverTrigger render={<Button variant="surface" />}>Dimensions</PopoverTrigger>
        <PopoverContent align="start">
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the width and height for the layer.</PopoverDescription>
          </PopoverHeader>
          <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
            <label htmlFor="popover-width" className="text-muted-foreground">
              Width
            </label>
            <Input id="popover-width" defaultValue="320px" className="w-24 text-right" />
            <label htmlFor="popover-height" className="text-muted-foreground">
              Height
            </label>
            <Input id="popover-height" defaultValue="180px" className="w-24 text-right" />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
