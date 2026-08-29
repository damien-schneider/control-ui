"use client";

import { Form as FormPrimitive } from "@base-ui/react/form";
import type { ComponentProps } from "react";
import { cn } from "@/components/control-ui/lib/cn";

export type FormErrors = Record<string, string | string[]>;

export type FormProps = ComponentProps<"form"> & {
  errors?: FormErrors;
  validationMode?: "onSubmit" | "onBlur" | "onChange";
};

// Merges externally-returned errors, keyed by Field name, onto matching FieldError.
export function Form({ className, ...props }: FormProps) {
  return (
    <FormPrimitive
      data-control-ui="form"
      data-control-family="field"
      data-field-kind="form"
      data-slot="root"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}
