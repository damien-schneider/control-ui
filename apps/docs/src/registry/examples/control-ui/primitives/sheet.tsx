"use client";

import { Button } from "@/components/control-ui/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/control-ui/ui/field";
import { Input } from "@/components/control-ui/ui/input";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/control-ui/ui/sheet";

export function PrimitiveSheetExample() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="surface" />}>Edit workspace</SheetTrigger>
      <SheetContent showCloseButton closeLabel="Close workspace settings">
        <SheetHeader>
          <SheetTitle>Workspace settings</SheetTitle>
          <SheetDescription>Changes apply to every member of the workspace.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input defaultValue="Acme" />
          </Field>
          <Field>
            <FieldLabel>URL slug</FieldLabel>
            <Input defaultValue="acme" />
            <FieldDescription>Lowercase letters, numbers, and hyphens.</FieldDescription>
          </Field>
        </SheetBody>
        <SheetFooter>
          <SheetClose render={<Button variant="surface" />}>Cancel</SheetClose>
          <SheetClose render={<Button variant="solid" tone="primary" />}>Save changes</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
