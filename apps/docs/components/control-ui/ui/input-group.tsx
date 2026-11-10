"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, MouseEvent, Ref, RefCallback, RefObject } from "react";
import { createContext, use, useRef } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";

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

const ownPressTargets =
  "input, textarea, select, button, a, label, summary, [role='button'], [role='combobox'], [role='slider'], [tabindex], [contenteditable], [data-slot='scrub-area']";

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
      "data-control": "true",
      "data-size": size,
      className: classes,
      // Addons and padding belong to the field: pressing them focuses its text control, as pressing an input's own padding does.
      onMouseDown(event: MouseEvent<HTMLDivElement>) {
        onMouseDown?.(event);
        const control = controlRef.current;
        if (event.defaultPrevented || event.button !== 0 || !control || control.matches(":disabled")) return;
        // React bubbles presses from portalled popups through here; only presses inside the group's own box count.
        if (!(event.target instanceof Element) || !event.currentTarget.contains(event.target)) return;
        const pressed = event.target.closest(ownPressTargets);
        if (pressed && event.currentTarget.contains(pressed)) return;
        event.preventDefault();
        control.focus();
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
