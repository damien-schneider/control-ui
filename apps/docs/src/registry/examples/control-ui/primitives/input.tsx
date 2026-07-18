"use client";

import { Field, FieldControl, FieldLabel } from "@/components/control-ui/ui/field";
import { Input } from "@/components/control-ui/ui/input";

export function PrimitiveInputExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl render={<Input type="email" placeholder="you@example.com" />} />
      </Field>
      <Field>
        <FieldLabel>Search</FieldLabel>
        <FieldControl render={<Input size="sm" placeholder="Search..." />} />
      </Field>
    </div>
  );
}
