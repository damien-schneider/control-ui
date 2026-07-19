"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import type {
  ButtonLabelProps,
  ButtonLinkProps,
  ButtonProps,
  ButtonShape,
  ButtonTone,
  ButtonVariant,
  ControlSize,
} from "@/components/control-ui/contracts";
import { controlSize, controlSurfaceClasses } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
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

function ButtonContent({ children }: { children: ReactNode }) {
  return (
    <span data-control-ui="button" data-slot="content" className={cn(buttonContentClasses, skinSlot("button", "content", {}))}>
      {children}
    </span>
  );
}

// Refined skin slot. 100% Base UI: composition flows through Base UI Button's `render` prop.
export function Button({
  variant = "quiet",
  size = "sm",
  tone = "neutral",
  active = false,
  iconOnly = false,
  shape = "default",
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
  const isNativeButton = nativeButton !== false;
  const content = render ? children : <ButtonContent>{children}</ButtonContent>;

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
      render={render}
      nativeButton={nativeButton}
      {...props}
    >
      {content}
    </BaseButton>
  );
}

export function ButtonLink({
  variant = "quiet",
  size = "sm",
  tone = "neutral",
  active = false,
  iconOnly = false,
  shape = "default",
  render,
  className,
  children,
  color: _color,
  ...props
}: ButtonLinkProps) {
  const skinClasses = skinSlot("button", "root", { variant, tone, size, shape, active });

  return useRender({
    defaultTagName: "a",
    render,
    props: {
      ...props,
      "data-control-ui": "button",
      "data-slot": "root",
      "data-control": "true",
      "data-active": active ? "true" : undefined,
      "data-icon-only": iconOnly ? "true" : undefined,
      "data-shape": shape,
      "data-variant": variant,
      "data-tone": tone,
      "data-size": size,
      className: cn(buttonRecipeClasses(variant, tone, size, shape), iconOnly && "aspect-square px-0", skinClasses, className),
      children: <ButtonContent>{children}</ButtonContent>,
    },
  });
}

export function ButtonLabel({
  variant = "quiet",
  size = "sm",
  tone = "neutral",
  active = false,
  iconOnly = false,
  shape = "default",
  className,
  children,
  color: _color,
  ...props
}: ButtonLabelProps) {
  const skinClasses = skinSlot("button", "root", { variant, tone, size, shape, active });

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: The wrapped file input is supplied through children.
    <label
      {...props}
      data-control-ui="button"
      data-slot="root"
      data-control="true"
      data-active={active ? "true" : undefined}
      data-icon-only={iconOnly ? "true" : undefined}
      data-shape={shape}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={cn(
        buttonRecipeClasses(variant, tone, size, shape),
        iconOnly && "aspect-square px-0",
        "has-focus-visible:ring-2 has-focus-visible:ring-foreground/20",
        skinClasses,
        className,
      )}
    >
      <ButtonContent>{children}</ButtonContent>
    </label>
  );
}
