"use client";

import { useState } from "react";

import { Button } from "@/components/control-ui/ui/button";
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/control-ui/ui/field";
import { Form } from "@/components/control-ui/ui/form";
import { Input } from "@/components/control-ui/ui/input";

export function PrimitiveFormExample() {
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  return (
    <Form
      className="max-w-sm"
      errors={errors}
      onSubmit={(event) => {
        event.preventDefault();
        const username = String(new FormData(event.currentTarget).get("username") ?? "");
        // Mimics server rejecting a reserved name; keys match each Field's `name`.
        setErrors(username.trim().toLowerCase() === "admin" ? { username: "'admin' is reserved." } : {});
      }}
    >
      <Field name="username">
        <FieldLabel>Username</FieldLabel>
        <FieldControl render={<Input required placeholder="e.g. ada132" size="sm" />} />
        <FieldError />
      </Field>
      <Button type="submit" variant="solid" size="sm" tone="primary" className="self-start">
        Create account
      </Button>
    </Form>
  );
}
