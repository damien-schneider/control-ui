"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import type { AvatarFallbackProps, AvatarGroupProps, AvatarImageProps, AvatarProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-control-ui="avatar"
      data-slot="root"
      className={cn(
        "relative inline-flex size-9 shrink-0 select-none items-center justify-center overflow-hidden rounded-full align-middle",
        skinSlot("avatar", "root", {}),
        className,
      )}
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
      data-slot="group"
      className={cn(
        "isolate inline-flex items-center -space-x-2 [&>[data-control-ui=avatar]]:ring-2 [&>[data-control-ui=avatar]]:ring-background",
        skinSlot("avatar", "group", {}),
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image data-control-ui="avatar" data-slot="image" className={cn("size-full object-cover", className)} {...props} />
  );
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-control-ui="avatar"
      data-slot="fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground",
        skinSlot("avatar", "fallback", {}),
        className,
      )}
      {...props}
    />
  );
}
