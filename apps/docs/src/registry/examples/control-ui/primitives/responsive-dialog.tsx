"use client";

import { Button } from "@/components/control-ui/ui/button";
import { Field, FieldControl, FieldLabel } from "@/components/control-ui/ui/field";
import { Input } from "@/components/control-ui/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/control-ui/ui/responsive-dialog";

export function PrimitiveResponsiveDialogExample() {
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger render={<Button variant="surface">Edit profile</Button>} />
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit profile</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>This opens as a dialog on desktop and a swipeable drawer on mobile.</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="px-4">
          <Field>
            <FieldLabel htmlFor="responsive-dialog-name">Display name</FieldLabel>
            <FieldControl render={<Input id="responsive-dialog-name" defaultValue="Ada Lovelace" />} />
          </Field>
        </div>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose>Cancel</ResponsiveDialogClose>
          <ResponsiveDialogClose variant="solid" tone="primary">
            Save changes
          </ResponsiveDialogClose>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
