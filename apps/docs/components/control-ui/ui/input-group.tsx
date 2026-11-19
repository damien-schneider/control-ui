"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, MouseEvent, Ref, RefCallback, RefObject } from "react";
import { createContext, use, useRef } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { focusTextControlOnPress } from "@/components/control-ui/lib/press-focus";

export type InputGroupProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & FieldKnobStyle } & {
  render?: RenderProp<ComponentProps<"div">>;
  size?: ControlSize;
};

export type InputGroupAddonProps = ComponentProps<"span"> & { style?: CSSProperties & FieldKnobStyle };

const InputGroupSurfaceContext = createContext(false);
const InputGroupControlContext = createContext<RefObject<HTMLElement | null> | null>(null);

export function useIsInsideInputGroup() {
  return use(InputGroupSurfaceContext);
}

// In-group text controls pass their ref through this, so the group can focus them from its addons and padding.
export function useInputGroupControlRef<Control extends HTMLElement>(ref?: Ref<Control>): RefCallback<Control> {
  const groupControlRef = use(InputGroupControlContext);
  return (node) => {
    if (groupControlRef) groupControlRef.current = node;
    if (typeof ref === "function") return ref(node);
    if (ref) ref.current = node;
    return undefined;
  };
}

export function InputGroup({ size = "md", className, render, children, onMouseDown, ...props }: InputGroupProps) {
  const controlRef = useRef<HTMLElement | null>(null);
  const classes = cn("flex min-w-0 w-full items-center overflow-hidden", className);

  const group = useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      "data-control-ui": "input-group",
      "data-slot": "root",
      "data-control-family": "field",
      "data-field-kind": "input-group",
      "data-control": "true",
      "data-size": size,
      className: classes,
      onMouseDown(event: MouseEvent<HTMLDivElement>) {
        onMouseDown?.(event);
        focusTextControlOnPress(event, controlRef.current);
      },
      children,
    },
  });
  return (
    <InputGroupSurfaceContext value={true}>
      <InputGroupControlContext value={controlRef}>{group}</InputGroupControlContext>
    </InputGroupSurfaceContext>
  );
}

export function InputGroupAddon({ className, ...props }: InputGroupAddonProps) {
  return (
    <span
      {...props}
      data-control-ui="input-group"
      data-control-family="field"
      data-field-kind="input-group"
      data-slot="addon"
      className={cn("inline-flex shrink-0 items-center", className)}
    />
  );
}
