"use client";

import { useState } from "react";
import { flattenError, object } from "zod";

import { phoneNumberSchema } from "@/components/control-ui/lib/phone-number";
import { Button } from "@/components/control-ui/ui/button";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/control-ui/ui/field";
import { Form } from "@/components/control-ui/ui/form";
import { PhoneInput } from "@/components/control-ui/ui/phone-input";

const formSchema = object({ phone: phoneNumberSchema });

export function PrimitivePhoneInputExample() {
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});
  const [submittedPhone, setSubmittedPhone] = useState<string>();

  return (
    <Form
      className="max-w-sm"
      errors={errors}
      onSubmit={(event) => {
        event.preventDefault();
        const result = formSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));

        if (!result.success) {
          const fieldErrors = flattenError(result.error).fieldErrors;
          setErrors({ phone: fieldErrors.phone ?? "Enter a valid phone number." });
          setSubmittedPhone(undefined);
          return;
        }

        setErrors({});
        setSubmittedPhone(result.data.phone);
      }}
    >
      <Field name="phone">
        <FieldLabel>Phone number</FieldLabel>
        <FieldControl
          render={
            <PhoneInput
              defaultCountry="FR"
              required
              placeholder="7 50 32 67 15"
              countrySearchPlaceholder="Search country or calling code..."
            />
          }
        />
        <FieldDescription>Formatted while typing and submitted as E.164.</FieldDescription>
        <FieldError />
      </Field>
      <Button type="submit" variant="solid" size="sm" tone="primary" className="self-start">
        Validate number
      </Button>
      <p className="min-h-4 text-meta text-muted-foreground" aria-live="polite">
        {submittedPhone ? `Submitted: ${submittedPhone}` : null}
      </p>
    </Form>
  );
}
