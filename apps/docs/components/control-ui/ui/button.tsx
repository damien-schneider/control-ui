"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { ControlSize, ControlTone, ControlVariant } from "@/components/control-ui/control-variants";
import { buttonGapClass, controlSize } from "@/components/control-ui/control-variants";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinAdornment } from "@/components/control-ui/skin";

export type ButtonVariant = ControlVariant;

export type ButtonSize = ControlSize;

export type ButtonTone = ControlTone;

export const buttonShapes = ["default", "circle"] as const;

export type ButtonShape = (typeof buttonShapes)[number];

export type ButtonAppearanceProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  active?: boolean;
  iconOnly?: boolean;
  shape?: ButtonShape;
  style?: CSSProperties & ButtonKnobStyle;
};

export type ButtonProps = ComponentProps<"button"> &
  ButtonAppearanceProps & {
    render?: RenderProp<ComponentProps<"button">, { disabled: boolean }>;
    nativeButton?: boolean;
  };

export type ButtonLinkProps = ComponentProps<"a"> &
  ButtonAppearanceProps & {
    render?: RenderProp<ComponentProps<"a">>;
  };

export type ButtonLabelProps = ComponentProps<"label"> & ButtonAppearanceProps;

const buttonStructureClasses = "relative isolate inline-flex shrink-0 items-center justify-center overflow-visible whitespace-nowrap";

export const buttonContentClasses = "relative z-[1] inline-flex min-w-0 items-center justify-center gap-[inherit]";

export function buttonRecipeClasses(size: ControlSize, iconOnly = false): string {
  return cn(buttonStructureClasses, controlSize({ size }), buttonGapClass, iconOnly && "aspect-square px-0");
}

function ButtonContent({ children }: { children: ReactNode }) {
  return (
    <span data-control-ui="button" data-control-family="button" data-slot="content" className={buttonContentClasses}>
      {children}
    </span>
  );
}

/** The content wrapper only earns its node when a skin layer sits behind it and needs stacking above it. */
function ButtonBody({ layer, wrap = true, children }: { layer: ReactNode; wrap?: boolean; children: ReactNode }) {
  return (
    <>
      {layer}
      {wrap && layer ? <ButtonContent>{children}</ButtonContent> : children}
    </>
  );
}

// composition flows through Base UI Button's `render` prop
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
  ...props
}: ButtonProps) {
  const layer = skinAdornment("button", "layer", { variant, tone });

  return (
    <BaseButton
      type={nativeButton === false ? undefined : type}
      disabled={disabled}
      data-control-ui="button"
      data-control-family="button"
      data-slot="root"
      data-control="true"
      data-active={active ? "true" : undefined}
      data-icon-only={iconOnly ? "true" : undefined}
      data-shape={shape}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={cn(buttonRecipeClasses(size, iconOnly), className)}
      render={render}
      nativeButton={nativeButton}
      {...props}
    >
      <ButtonBody layer={layer} wrap={!render}>
        {children}
      </ButtonBody>
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
  ...props
}: ButtonLinkProps) {
  return useRender({
    defaultTagName: "a",
    render,
    props: {
      ...props,
      "data-control-ui": "button",
      "data-control-family": "button",
      "data-slot": "root",
      "data-control": "true",
      "data-active": active ? "true" : undefined,
      "data-icon-only": iconOnly ? "true" : undefined,
      "data-shape": shape,
      "data-variant": variant,
      "data-tone": tone,
      "data-size": size,
      className: cn(buttonRecipeClasses(size, iconOnly), className),
      children: <ButtonBody layer={skinAdornment("button", "layer", { variant, tone })}>{children}</ButtonBody>,
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
  ...props
}: ButtonLabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: The wrapped file input is supplied through children.
    <label
      {...props}
      data-control-ui="button"
      data-control-family="button"
      data-slot="root"
      data-control="true"
      data-active={active ? "true" : undefined}
      data-icon-only={iconOnly ? "true" : undefined}
      data-shape={shape}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={cn(buttonRecipeClasses(size, iconOnly), className)}
    >
      <ButtonBody layer={skinAdornment("button", "layer", { variant, tone })}>{children}</ButtonBody>
    </label>
  );
}
