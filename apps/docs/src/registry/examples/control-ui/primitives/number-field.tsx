"use client";

import { useState } from "react";

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/components/control-ui/ui/number-field";

export function PrimitiveNumberFieldExample() {
  const [quantity, setQuantity] = useState<number | null>(1);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {/* Controlled, clamped 0–99. The label lives inside a ScrubArea, so it can be dragged left/right
          to change the value in addition to the ± buttons and keyboard arrows. */}
      <NumberField
        id="quantity"
        value={quantity}
        onValueChange={setQuantity}
        min={0}
        max={99}
        className="flex flex-col items-start gap-1.5"
      >
        <NumberFieldScrubArea>
          <label htmlFor="quantity" className="cursor-ew-resize text-[11px] font-medium text-muted-foreground">
            Quantity
          </label>
        </NumberFieldScrubArea>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput className="w-16" />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>

      {/* Uncontrolled + Intl currency formatting. Larger size to show the shared control-height ramp. */}
      <NumberField
        id="budget"
        size="lg"
        defaultValue={2500}
        min={0}
        step={100}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        className="flex flex-col items-start gap-1.5"
      >
        <label htmlFor="budget" className="text-[11px] font-medium text-muted-foreground">
          Monthly budget
        </label>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput className="w-28" />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>

      <span className="text-[11px] text-muted-foreground">{quantity === null ? "No quantity set" : `Selected quantity: ${quantity}`}</span>
    </div>
  );
}
