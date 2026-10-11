"use client";

import type { ComponentProps, CSSProperties } from "react";
import { createContext, use, useId } from "react";
import type { ChannelStripKnobStyle } from "@/components/control-ui/knob-contracts/channel-strip-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type ChannelStripVariant = "default" | "master";

type ChannelStripPartProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ChannelStripKnobStyle };

export type MixerProps = ChannelStripPartProps;

export type ChannelStripProps = ChannelStripPartProps & { variant?: ChannelStripVariant };

export type ChannelStripHeaderProps = ChannelStripPartProps;

export type ChannelStripTitleProps = ComponentProps<"span">;

export type ChannelStripActionsProps = ChannelStripPartProps;

export type ChannelStripBodyProps = ChannelStripPartProps;

export type ChannelStripValueProps = ChannelStripPartProps;

export type ChannelStripControlsProps = ChannelStripPartProps;

const ChannelStripTitleIdContext = createContext<string | null>(null);

export function Mixer({ className, ...props }: MixerProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a mixer is a named group of channel strips, not a fieldset form group.
    <div role="group" data-control-ui="channel-strip" data-control-family="channel-strip" data-slot="mixer" className={className} {...props} />
  );
}

export function ChannelStrip({ variant = "default", className, ...props }: ChannelStripProps) {
  const titleId = useId();
  return (
    <ChannelStripTitleIdContext value={titleId}>
      {/* biome-ignore lint/a11y/useSemanticElements: a channel strip is a labelled group of controls, not a fieldset form group. */}
      <div
        role="group"
        aria-labelledby={titleId}
        data-control-ui="channel-strip"
        data-control-family="channel-strip"
        data-slot="root"
        data-variant={variant}
        className={cn("min-w-0", className)}
        {...props}
      />
    </ChannelStripTitleIdContext>
  );
}

export function ChannelStripHeader({ className, ...props }: ChannelStripHeaderProps) {
  return (
    <div
      data-control-ui="channel-strip"
      data-control-family="channel-strip"
      data-slot="header"
      className={cn("flex min-w-0 items-center", className)}
      {...props}
    />
  );
}

export function ChannelStripTitle({ className, ...props }: ChannelStripTitleProps) {
  const titleId = use(ChannelStripTitleIdContext);
  return (
    <span
      data-control-ui="channel-strip"
      data-control-family="channel-strip"
      data-slot="title"
      className={cn("min-w-0 flex-1 truncate text-caption", className)}
      {...props}
      id={titleId ?? undefined}
    />
  );
}

export function ChannelStripActions({ className, ...props }: ChannelStripActionsProps) {
  return (
    <div
      data-control-ui="channel-strip"
      data-control-family="channel-strip"
      data-slot="actions"
      className={cn("flex shrink-0 items-center", className)}
      {...props}
    />
  );
}

export function ChannelStripBody({ className, ...props }: ChannelStripBodyProps) {
  return (
    <div
      data-control-ui="channel-strip"
      data-control-family="channel-strip"
      data-slot="body"
      className={cn("flex items-stretch justify-center", className)}
      {...props}
    />
  );
}

export function ChannelStripValue({ className, ...props }: ChannelStripValueProps) {
  return (
    <div
      data-control-ui="channel-strip"
      data-control-family="channel-strip"
      data-slot="value"
      className={cn("text-caption tabular-nums", className)}
      {...props}
    />
  );
}

export function ChannelStripControls({ className, ...props }: ChannelStripControlsProps) {
  return (
    <div
      data-control-ui="channel-strip"
      data-control-family="channel-strip"
      data-slot="controls"
      className={cn("flex flex-wrap content-start items-center justify-center", className)}
      {...props}
    />
  );
}
