"use client";

import { Form as FormPrimitive } from "@base-ui/react/form";
import type { FormProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

// Merges externally-returned errors, keyed by Field name, onto matching FieldError.
export function Form({ className, ...props }: FormProps) {
  return <FormPrimitive data-control-ui="form" data-slot="root" className={cn("flex w-full flex-col gap-5", className)} {...props} />;
}
