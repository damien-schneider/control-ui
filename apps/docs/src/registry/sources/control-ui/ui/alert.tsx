"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { AlertKnobStyle } from "@/components/control-ui/knob-contracts/alert-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export const alertTones = ["neutral", "info", "success", "warning", "danger"] as const;

export type AlertTone = (typeof alertTones)[number];

export type AlertProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & AlertKnobStyle } & { tone?: AlertTone };

export type AlertTitleProps = Omit<ComponentProps<"div">, "style"> & {
  render?: RenderProp<ComponentProps<"div">>;
  style?: CSSProperties & AlertKnobStyle;
};

export type AlertDescriptionProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & AlertKnobStyle };

export type AlertActionProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & AlertKnobStyle };

export function Alert({ tone = "neutral", className, ...props }: AlertProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      data-control-ui="alert"
      data-control-family="alert"
      data-slot="root"
      data-surface="panel"
      data-tone={tone}
      className={cn("relative grid w-full items-start", className)}
      {...props}
    />
  );
}

export function AlertTitle({ render, className, ...props }: AlertTitleProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      "data-control-ui": "alert",
      "data-control-family": "alert",
      "data-slot": "title",
      className: cn("col-start-2 min-w-0", className),
    },
  });
}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      data-control-ui="alert"
      data-control-family="alert"
      data-slot="description"
      className={cn("col-start-2 grid min-w-0 justify-items-start", className)}
      {...props}
    />
  );
}

export function AlertAction({ className, ...props }: AlertActionProps) {
  return (
    <div
      data-control-ui="alert"
      data-control-family="alert"
      data-slot="action"
      className={cn("col-start-3 row-span-2 row-start-1 flex items-center gap-1 self-start", className)}
      {...props}
    />
  );
}
