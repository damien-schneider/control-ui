"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Children, createContext, Fragment, isValidElement, useContext } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { ControlSize, ControlTone, ControlVariant } from "@/components/control-ui/control-variants";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinAdornment } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

export type ButtonVariant = ControlVariant;

export type ButtonSize = ControlSize;

export type ButtonTone = ControlTone;

export const ButtonTrackContext = createContext(false);

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

export const buttonStructureClasses =
  "relative isolate inline-flex shrink-0 items-center justify-center overflow-visible whitespace-nowrap";

export const buttonTrackStructureClasses = "data-[track=hover]:relative data-[track=hover]:isolate [&_[data-track-item]]:[isolation:auto]";

export const buttonContentClasses = "relative z-[1] inline-flex min-w-0 items-center justify-center gap-[inherit]";

function wrapButtonText(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return <span className="contents">{child}</span>;
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      return <Fragment>{wrapButtonText(child.props.children)}</Fragment>;
    }
    return child;
  });
}

function ButtonContent({ children }: { children: ReactNode }) {
  return (
    <span data-control-ui="button" data-control-family="button" data-slot="content" className={buttonContentClasses}>
      {children}
    </span>
  );
}

function ButtonBody({ layer, wrap = true, children }: { layer: ReactNode; wrap?: boolean; children: ReactNode }) {
  const tracksHover = useContext(ButtonTrackContext);
  const wrapsContent = tracksHover || (wrap && Boolean(layer));
  const content = wrapButtonText(children);
  return (
    <>
      {layer}
      {wrapsContent ? <ButtonContent>{content}</ButtonContent> : content}
    </>
  );
}

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
  const skin = useSkin();
  const layer = skinAdornment(skin, "button", "layer", { variant, tone });
  const tracksHover = useContext(ButtonTrackContext);

  return (
    <BaseButton
      type={nativeButton === false ? undefined : type}
      disabled={disabled}
      data-control-ui="button"
      data-control-family="button"
      data-slot="root"
      data-control="true"
      data-track-item={tracksHover ? "" : undefined}
      data-active={active ? "true" : undefined}
      data-icon-only={iconOnly ? "true" : undefined}
      data-shape={shape}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={cn(buttonStructureClasses, className)}
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
  const skin = useSkin();
  const tracksHover = useContext(ButtonTrackContext);
  return useRender({
    defaultTagName: "a",
    render,
    props: {
      "data-track-item": tracksHover ? "" : undefined,
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
      className: cn(buttonStructureClasses, className),
      children: <ButtonBody layer={skinAdornment(skin, "button", "layer", { variant, tone })}>{children}</ButtonBody>,
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
  const skin = useSkin();
  const tracksHover = useContext(ButtonTrackContext);
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: The wrapped file input is supplied through children.
    <label
      data-track-item={tracksHover ? "" : undefined}
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
      className={cn(buttonStructureClasses, className)}
    >
      <ButtonBody layer={skinAdornment(skin, "button", "layer", { variant, tone })}>{children}</ButtonBody>
    </label>
  );
}
