"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import type { ComponentProps, CSSProperties } from "react";
import type { AvatarKnobStyle } from "@/components/control-ui/knob-contracts/avatar-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type AvatarProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & AvatarKnobStyle };

export type AvatarGroupProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & AvatarKnobStyle };

export type AvatarImageProps = ComponentProps<"img"> & {
  onLoadingStatusChange?: (status: "idle" | "loading" | "loaded" | "error") => void;
} & { style?: CSSProperties & AvatarKnobStyle };

export type AvatarFallbackProps = Omit<ComponentProps<"span">, "style"> & {
  delay?: number;
  style?: CSSProperties & AvatarKnobStyle;
};

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-control-ui="avatar"
      data-control-family="avatar"
      data-slot="root"
      className={cn("relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden align-middle", className)}
      {...props}
    />
  );
}

export function AvatarGroup({ className, ...props }: AvatarGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Profile imagery is not a form fieldset.
    <div
      role="group"
      data-control-ui="avatar"
      data-control-family="avatar"
      data-slot="group"
      className={cn("isolate inline-flex items-center -space-x-2", className)}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-control-ui="avatar"
      data-control-family="avatar"
      data-slot="image"
      className={cn("size-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-control-ui="avatar"
      data-control-family="avatar"
      data-slot="fallback"
      className={cn("flex size-full items-center justify-center", className)}
      {...props}
    />
  );
}
