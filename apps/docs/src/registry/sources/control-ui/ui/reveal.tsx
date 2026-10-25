"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { RevealKnobStyle } from "@/components/control-ui/knob-contracts/reveal-knobs";

export type RevealScopeProps = Omit<ComponentProps<"div">, "style"> & {
  render?: RenderProp<ComponentProps<"div">>;
  style?: CSSProperties & RevealKnobStyle;
};

export type RevealProps = Omit<ComponentProps<"span">, "style"> & {
  render?: RenderProp<ComponentProps<"span">>;
  style?: CSSProperties & RevealKnobStyle;
};

export function RevealScope({ render, ...props }: RevealScopeProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      "data-control-ui": "reveal",
      "data-control-family": "reveal",
      "data-slot": "scope",
    },
  });
}

export function Reveal({ render, ...props }: RevealProps) {
  return useRender({
    defaultTagName: "span",
    render,
    props: {
      ...props,
      "data-control-ui": "reveal",
      "data-control-family": "reveal",
      "data-slot": "content",
    },
  });
}
