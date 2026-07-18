"use client";

import {
  Field,
  FieldContent,
  FieldControl,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/control-ui/ui/field";
import { Input } from "@/components/control-ui/ui/input";
import { Switch } from "@/components/control-ui/ui/switch";

export function PrimitiveFieldExample() {
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Profile</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel>Display name</FieldLabel>
          <FieldControl render={<Input placeholder="Ada Lovelace" size="sm" />} />
          <FieldDescription>Shown next to your messages.</FieldDescription>
        </Field>
        <FieldSeparator />
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel htmlFor="field-product-updates">Product updates</FieldLabel>
            <FieldDescription>Receive occasional release notes and product news.</FieldDescription>
          </FieldContent>
          <Switch id="field-product-updates" defaultChecked />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
