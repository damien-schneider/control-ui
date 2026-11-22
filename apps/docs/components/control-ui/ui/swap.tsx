"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Children, createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import type { SwapKnobStyle } from "@/components/control-ui/knob-contracts/swap-knobs";

export type SwapItemState = "active" | "exiting" | "inactive";

type SwapTransition = { value: string; previous: string | null };

const SwapContext = createContext<SwapTransition | null>(null);

function useSwap() {
  const context = useContext(SwapContext);
  if (!context) throw new Error("SwapItem must be rendered inside <Swap>.");
  return context;
}

function naturalInlineSize(item: HTMLSpanElement) {
  const range = document.createRange();
  range.selectNodeContents(item);
  return Math.ceil(range.getBoundingClientRect().width);
}

function fitRootToItem(item: HTMLSpanElement) {
  const root = item.parentElement;
  if (!root) return;
  const truncates = root.hasAttribute("data-text");
  const observer = new ResizeObserver(([entry]) => {
    const [borderBox] = entry.borderBoxSize;
    // A hidden item measures 0: release the width so the next reveal snaps to size instead of growing from 0.
    if (borderBox.inlineSize === 0) root.style.removeProperty("--_swap-inline-size");
    else root.style.setProperty("--_swap-inline-size", `${truncates ? naturalInlineSize(item) : borderBox.inlineSize}px`);
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

export type SwapItemProps = ComponentProps<"span"> & {
  value: string;
};

export function SwapItem({ value, children, ref, ...props }: SwapItemProps) {
  const state = itemState(useSwap(), value);
  const itemRef = useRef<HTMLSpanElement | null>(null);
  const fitsRoot = state === "active";
  useLayoutEffect(() => (fitsRoot && itemRef.current ? fitRootToItem(itemRef.current) : undefined), [fitsRoot]);

  return (
    <span
      data-control-ui="swap"
      data-control-family="swap"
      data-slot="item"
      data-state={state}
      aria-hidden={state === "active" ? undefined : true}
      {...props}
      ref={(item) => {
        itemRef.current = item;
        if (typeof ref === "function") return ref(item);
        if (ref) ref.current = item;
      }}
    >
      {wrapLabelText(children)}
    </span>
  );
}

export type SwapTextProps = Omit<SwapProps, "value" | "children"> & {
  children: string;
};

export function SwapText({ children, ...props }: SwapTextProps) {
  const [texts, setTexts] = useState<{ current: string; previous: string | null }>({ current: children, previous: null });
  if (texts.current !== children) setTexts({ current: children, previous: texts.current });
  const shown = texts.previous === null ? [texts.current] : [texts.previous, texts.current];

  return (
    <Swap value={texts.current} data-text="" {...props}>
      {shown.map((text) => (
        <SwapItem key={text} value={text}>
          <span data-control-ui="swap" data-control-family="swap" data-slot="label">
            <span data-control-ui="swap" data-control-family="swap" data-slot="text">
              {text}
            </span>
          </span>
        </SwapItem>
      ))}
    </Swap>
  );
}
