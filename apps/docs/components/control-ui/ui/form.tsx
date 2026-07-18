"use client";

import { Form as FormPrimitive } from "@base-ui/react/form";
import type { FormProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot, 100% Base UI Form: thin <form> wrapper, consolidates validation across Fields.
// Merges external `errors` (server/action, keyed by Field.Root `name`) onto matching FieldError.
// Paints no control; composes any control-ui Field standalone.
export function Form({ className, ...props }: FormProps) {
  return (
    <FormPrimitive
      data-control-ui="form"
      data-slot="root"
      className={cn("flex w-full flex-col gap-5", skinSlot("form", "root", {}), className)}
      {...props}
    />
  );
}
