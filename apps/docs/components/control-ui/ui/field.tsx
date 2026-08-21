"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset";
import { cva } from "class-variance-authority";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Separator } from "@/components/control-ui/ui/separator";

export type FieldProps = ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal" | "responsive";
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  validationMode?: "onSubmit" | "onBlur" | "onChange";
} & { style?: CSSProperties & FieldKnobStyle };

export type FieldLabelProps = Omit<ComponentProps<"label">, "style"> & { style?: CSSProperties & FieldKnobStyle };

export type FieldContentProps = ComponentProps<"div"> & { style?: CSSProperties & FieldKnobStyle };

export type FieldTitleProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & FieldKnobStyle };

export type FieldControlProps = Omit<ComponentProps<"input">, "style"> & { style?: CSSProperties & FieldKnobStyle };

export type FieldDescriptionProps = Omit<ComponentProps<"p">, "style"> & { style?: CSSProperties & FieldKnobStyle };

export type FieldErrorMatch = boolean | keyof ValidityState;

export type FieldErrorProps = Omit<ComponentProps<"div">, "style"> & {
  match?: FieldErrorMatch;
  style?: CSSProperties & FieldKnobStyle;
};

export type FieldGroupProps = ComponentProps<"div"> & { style?: CSSProperties & FieldKnobStyle };

export type FieldSeparatorProps = Omit<ComponentProps<"div">, "style"> & {
  children?: ReactNode;
  style?: CSSProperties & FieldKnobStyle;
};

export type FieldItemProps = ComponentProps<"div"> & { style?: CSSProperties & FieldKnobStyle };

export type FieldSetProps = Omit<ComponentProps<"fieldset">, "style"> & { style?: CSSProperties & FieldKnobStyle };

export type FieldLegendProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & FieldKnobStyle };

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
      data-control-family="field"
      data-field-kind="field"
      data-slot="root"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

export function FieldContent({ className, ...props }: FieldContentProps) {
  return (
    <div
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="field"
      data-slot="content"
      className={cn("flex min-w-0 flex-1 flex-col gap-1", className)}
      {...props}
    />
  );
}

export function FieldTitle({ className, ...props }: FieldTitleProps) {
  return (
    <div data-control-ui="field" data-control-family="field" data-field-kind="field" data-slot="title" className={className} {...props} />
  );
}

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <FieldPrimitive.Label
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="field"
      data-slot="label"
      className={className}
      {...props}
    />
  );
}

type RefinedFieldControlProps = FieldControlProps & Pick<ComponentProps<typeof FieldPrimitive.Control>, "render">;

export function FieldControl({ className, render, ...props }: RefinedFieldControlProps) {
  const classes = cn("w-full", className);

  if (render !== undefined) {
    return (
      <FieldPrimitive.Control
        data-control-ui="field"
        data-control-family="field"
        data-field-kind="field"
        data-slot="control"
        className={classes}
        render={render}
        {...props}
      />
    );
  }

  return (
    <FieldPrimitive.Control
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="field"
      data-slot="control"
      data-control="true"
      className={classes}
      {...props}
    />
  );
}

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <FieldPrimitive.Description
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="field"
      data-slot="description"
      className={className}
      {...props}
    />
  );
}

export function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <FieldPrimitive.Error
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="field"
      data-slot="error"
      className={className}
      {...props}
    />
  );
}

export function FieldGroup({ className, ...props }: FieldGroupProps) {
  return (
    <div
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="field"
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
      data-control-family="field"
      data-field-kind="field"
      data-slot="separator"
      data-content={children ? "true" : undefined}
      className={cn("relative h-px", children && "my-2 h-5", className)}
      {...props}
    >
      <Separator className={children ? "absolute top-1/2" : undefined} />
      {children ? (
        <span
          data-control-ui="field"
          data-control-family="field"
          data-field-kind="field"
          data-slot="separator-content"
          className="relative mx-auto block w-fit px-2"
        >
          {children}
        </span>
      ) : null}
    </div>
  );
}

export function FieldItem({ className, ...props }: FieldItemProps) {
  return (
    <FieldPrimitive.Item
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="field"
      data-slot="item"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

export function FieldSet({ className, ...props }: FieldSetProps) {
  return (
    <FieldsetPrimitive.Root
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="field"
      data-slot="set"
      className={cn("m-0 flex min-w-0 flex-col gap-4 p-0", className)}
      {...props}
    />
  );
}

export function FieldLegend({ className, ...props }: FieldLegendProps) {
  return (
    <FieldsetPrimitive.Legend
      data-control-ui="field"
      data-control-family="field"
      data-field-kind="field"
      data-slot="legend"
      className={className}
      {...props}
    />
  );
}
