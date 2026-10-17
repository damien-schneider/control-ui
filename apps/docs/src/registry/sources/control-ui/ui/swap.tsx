"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Children, createContext, useContext, useState } from "react";
import type { SwapKnobStyle } from "@/components/control-ui/knob-contracts/swap-knobs";

export type SwapItemState = "active" | "exiting" | "inactive";

type SwapTransition = { value: string; previous: string | null };

const SwapContext = createContext<SwapTransition | null>(null);

function useSwap() {
  const context = useContext(SwapContext);
  if (!context) throw new Error("SwapItem must be rendered inside <Swap>.");
  return context;
}

function fitRootToItem(item: HTMLSpanElement) {
  const root = item.parentElement;
  if (!root) return;
  const observer = new ResizeObserver(([entry]) => {
    const [borderBox] = entry.borderBoxSize;
    root.style.setProperty("--_swap-inline-size", `${borderBox.inlineSize}px`);
  });
  observer.observe(item);
  return () => observer.disconnect();
}

export type SwapProps = Omit<ComponentProps<"span">, "style"> & {
  value: string;
  style?: CSSProperties & SwapKnobStyle;
};

export function Swap({ value, children, ...props }: SwapProps) {
  const [transition, setTransition] = useState<SwapTransition>({ value, previous: null });
  if (transition.value !== value) setTransition({ value, previous: transition.value });

  return (
    <SwapContext.Provider value={transition}>
      <span
        data-control-ui="swap"
        data-control-family="swap"
        data-slot="root"
        data-swapped={transition.previous === null ? undefined : ""}
        {...props}
      >
        {children}
      </span>
    </SwapContext.Provider>
  );
}

function itemState({ value, previous }: SwapTransition, itemValue: string): SwapItemState {
  if (itemValue === value) return "active";
  if (itemValue === previous) return "exiting";
  return "inactive";
}

function wrapLabelText(children: ReactNode): ReactNode {
  return Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number" ? (
      <span data-control-ui="swap" data-control-family="swap" data-slot="label">
        {child}
      </span>
    ) : (
      child
    ),
  );
}

export type SwapItemProps = Omit<ComponentProps<"span">, "ref"> & {
  value: string;
};

export function SwapItem({ value, children, ...props }: SwapItemProps) {
  const state = itemState(useSwap(), value);

  return (
    <span
      data-control-ui="swap"
      data-control-family="swap"
      data-slot="item"
      data-state={state}
      aria-hidden={state === "active" ? undefined : true}
      {...props}
      ref={state === "active" ? fitRootToItem : undefined}
    >
      {wrapLabelText(children)}
    </span>
  );
}
