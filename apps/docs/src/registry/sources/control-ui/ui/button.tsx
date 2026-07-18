"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import type { ButtonProps, ButtonShape, ButtonTone, ButtonVariant, ControlSize } from "@/components/control-ui/contracts";
import { controlSize, controlSurfaceClasses } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { resolveAsChildElement } from "@/components/control-ui/lib/use-as-child-render";
import { skinSlot } from "@/components/control-ui/skin";

// `variant` = visual structure (see ButtonProps contract); radius/size come from shared tokens so every control matches.
const buttonVariant = cva(
  "relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center overflow-visible whitespace-nowrap rounded-[var(--radius-control)] font-medium outline-none transition duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.98]",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        surface: controlSurfaceClasses,
        ghost: "text-foreground hover:bg-foreground/6",
        quiet:
          "text-muted-foreground hover:bg-foreground/6 hover:text-foreground data-[active=true]:bg-foreground/8 data-[active=true]:text-foreground",
      },
    },
    defaultVariants: {
      variant: "quiet",
    },
  },
);

export const buttonContentClasses = "relative z-[1] inline-flex min-w-0 items-center justify-center gap-[inherit]";

// `tone` = color intent, layered after `variant` so it wins on the colored properties.
function toneClasses(variant: ButtonVariant, tone: ButtonTone): string {
  if (tone === "neutral") return "";
  const solid = variant === "solid";
  if (tone === "primary") {
    return solid ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-primary-text hover:text-primary-text";
  }
  return solid ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "text-destructive-text hover:text-destructive-text";
}

export function buttonRecipeClasses(variant: ButtonVariant, tone: ButtonTone, size: ControlSize, shape: ButtonShape = "default"): string {
  return cn(buttonVariant({ variant }), controlSize({ size }), toneClasses(variant, tone), shape === "circle" && "rounded-full");
}

// Refined skin slot. 100% Base UI: composition flows through Base UI Button's `render` prop.
export function Button({
  variant = "quiet",
  size = "sm",
  tone = "neutral",
  active = false,
  iconOnly = false,
  shape = "default",
  asChild = false,
  type = "button",
  disabled,
  render,
  nativeButton,
  className,
  children,
  color: _color,
  ...props
}: ButtonProps) {
  // Skin resolves after library recipe, before caller's className: tailwind-merge order (not CSS specificity) decides the winner.
  const skinClasses = skinSlot("button", "root", { variant, tone, size, shape, active });
  const classes = cn(buttonRecipeClasses(variant, tone, size, shape), iconOnly && "aspect-square px-0", skinClasses, className);
  const child = resolveAsChildElement(asChild, children);
  // asChild rendering a non-<button> (e.g. a link) needs nativeButton told to Base UI to preserve button semantics.
  const isNativeButton = child ? child.type === "button" : nativeButton !== false;
  const renderProp: Pick<ComponentProps<typeof BaseButton>, "render" | "nativeButton"> = child
    ? { render: child, nativeButton: isNativeButton }
    : { render, nativeButton };
  let content: ReactNode;
  if (child) content = undefined;
  else if (render) content = children;
  else {
    content = (
      <span data-control-ui="button" data-slot="content" className={cn(buttonContentClasses, skinSlot("button", "content", {}))}>
        {children}
      </span>
    );
  }

  return (
    <BaseButton
      {...(isNativeButton ? { type } : {})}
      disabled={disabled}
      data-control-ui="button"
      data-slot="root"
      data-control="true"
      data-active={active ? "true" : undefined}
      data-icon-only={iconOnly ? "true" : undefined}
      data-shape={shape}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={classes}
      {...renderProp}
      {...props}
    >
      {content}
    </BaseButton>
  );
}
