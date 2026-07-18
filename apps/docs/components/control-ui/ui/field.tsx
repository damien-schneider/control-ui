"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import type {
  FieldContentProps,
  FieldControlProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldGroupProps,
  FieldItemProps,
  FieldLabelProps,
  FieldLegendProps,
  FieldProps,
  FieldSeparatorProps,
  FieldSetProps,
  FieldTitleProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { Separator } from "@/components/control-ui/ui/separator";

// Refined skin slot, 100% Base UI Field+Fieldset. Pure layout+text — never paints a control;
// consumer passes control-ui Input/Select/Textarea via FieldControl's `render` prop.
// Base UI stamps data-valid/-invalid/-dirty/-touched/-filled/-focused so skins react w/o JS.

const fieldVariants = cva("group/field flex w-full gap-3", {
  variants: {
    orientation: {
      vertical:
        "flex-col items-start [&>[data-control-ui=field][data-slot=content]]:w-full [&>[data-control-ui=field][data-slot=control]]:w-full",
      horizontal:
        "flex-row items-center [&>[data-control-ui=field][data-slot=label]]:flex-auto has-[>[data-control-ui=field][data-slot=content]]:items-start",
      responsive:
        "flex-col items-start [&>[data-control-ui=field][data-slot=content]]:w-full [&>[data-control-ui=field][data-slot=control]]:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>[data-control-ui=field][data-slot=content]]:w-auto @md/field-group:[&>[data-control-ui=field][data-slot=control]]:w-auto @md/field-group:[&>[data-control-ui=field][data-slot=label]]:flex-auto @md/field-group:has-[>[data-control-ui=field][data-slot=content]]:items-start",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

export function Field({ className, orientation = "vertical", ...props }: FieldProps) {
  return (
    <FieldPrimitive.Root
      data-control-ui="field"
      data-slot="root"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), skinSlot("field", "root", {}), className)}
      {...props}
    />
  );
}

export function FieldContent({ className, ...props }: FieldContentProps) {
  return <div data-control-ui="field" data-slot="content" className={cn("flex min-w-0 flex-1 flex-col gap-1", className)} {...props} />;
}

export function FieldTitle({ className, ...props }: FieldTitleProps) {
  return <div data-control-ui="field" data-slot="title" className={cn("text-label font-medium text-foreground", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <FieldPrimitive.Label
      data-control-ui="field"
      data-slot="label"
      className={cn("text-label font-medium text-foreground data-[disabled]:opacity-50", skinSlot("field", "label", {}), className)}
      {...props}
    />
  );
}

// `render` type pulled from Base UI primitive so composed controls (Input/Select/Textarea) merge correctly.
type RefinedFieldControlProps = FieldControlProps & Pick<ComponentProps<typeof FieldPrimitive.Control>, "render">;

export function FieldControl({ className, ...props }: RefinedFieldControlProps) {
  // Pass render={<Input/>} (or Select/Textarea) to merge field wiring; no render = bare <input>.
  return <FieldPrimitive.Control data-control-ui="field" data-slot="control" className={cn("w-full", className)} {...props} />;
}

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <FieldPrimitive.Description
      data-control-ui="field"
      data-slot="description"
      className={cn("text-meta text-muted-foreground", skinSlot("field", "description", {}), className)}
      {...props}
    />
  );
}

export function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <FieldPrimitive.Error
      data-control-ui="field"
      data-slot="error"
      className={cn("text-meta text-destructive-text", skinSlot("field", "error", {}), className)}
      {...props}
    />
  );
}

export function FieldGroup({ className, ...props }: FieldGroupProps) {
  return (
    <div
      data-control-ui="field"
      data-slot="group"
      className={cn("group/field-group @container/field-group flex flex-col gap-5", className)}
      {...props}
    />
  );
}

export function FieldSeparator({ children, className, ...props }: FieldSeparatorProps) {
  return (
    <div
      data-control-ui="field"
      data-slot="separator"
      data-content={children ? "true" : undefined}
      className={cn("relative h-px text-meta", children && "my-2 h-5", className)}
      {...props}
    >
      <Separator className={cn(children && "absolute top-1/2")} />
      {children ? (
        <span
          data-control-ui="field"
          data-slot="separator-content"
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
        >
          {children}
        </span>
      ) : null}
    </div>
  );
}

export function FieldItem({ className, ...props }: FieldItemProps) {
  // Base UI Field.Item: one labelled row in a Fieldset group (e.g. radio option); scopes label/description/validity.
  return (
    <FieldPrimitive.Item
      data-control-ui="field"
      data-slot="item"
      className={cn("flex items-center gap-2", skinSlot("field", "item", {}), className)}
      {...props}
    />
  );
}

export function FieldSet({ className, ...props }: FieldSetProps) {
  return (
    <FieldsetPrimitive.Root
      data-control-ui="field"
      data-slot="set"
      className={cn("m-0 flex min-w-0 flex-col gap-4 border-0 p-0", skinSlot("field", "set", {}), className)}
      {...props}
    />
  );
}

export function FieldLegend({ className, ...props }: FieldLegendProps) {
  return (
    <FieldsetPrimitive.Legend
      data-control-ui="field"
      data-slot="legend"
      className={cn("text-label font-semibold text-foreground", skinSlot("field", "legend", {}), className)}
      {...props}
    />
  );
}
