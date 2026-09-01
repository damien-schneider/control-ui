"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type InputGroupProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & FieldKnobStyle } & {
  render?: RenderProp<ComponentProps<"div">>;
  size?: ControlSize;
};

export type InputGroupAddonProps = ComponentProps<"span"> & { style?: CSSProperties & FieldKnobStyle };

export function InputGroup({ size = "md", className, render, children, ...props }: InputGroupProps) {
  const classes = cn("flex min-w-0 w-full items-center overflow-hidden", className);

  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      "data-control-ui": "input-group",
      "data-slot": "root",
      "data-control-family": "field",
      "data-control": "true",
      "data-size": size,
      className: classes,
      children,
    },
  });
}

export function InputGroupAddon({ className, ...props }: InputGroupAddonProps) {
  return (
    <span
      data-control-ui="input-group"
      data-control-family="field"
      data-field-kind="input-group"
      data-slot="addon"
      className={cn("inline-flex shrink-0 items-center", className)}
      {...props}
    />
  );
}

export function InputGroupInput({ className, ...props }: ComponentProps<"input"> & { style?: CSSProperties & FieldKnobStyle }) {
  return (
    <input
      data-control-ui="input-group"
      data-control-family="field"
      data-field-kind="input-group"
      data-slot="input"
      className={cn("h-full min-w-0 flex-1", className)}
      {...props}
    />
  );
}
