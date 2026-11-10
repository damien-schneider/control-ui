"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";

export type LiveStatusProps = Omit<ComponentProps<"span">, "role" | "children"> & {
  message: string;
  /** Change it to announce an unchanged `message` again: assistive tech skips a live region whose text did not change. */
  announcementKey?: string | number;
};

export function LiveStatus({ message, announcementKey, className, ...props }: LiveStatusProps) {
  const [repeat, setRepeat] = useState({ key: announcementKey, marked: false });
  if (repeat.key !== announcementKey) setRepeat({ key: announcementKey, marked: !repeat.marked });

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      {...props}
      role="status"
      data-control-ui="live-status"
      data-slot="root"
      className={cn("sr-only", className)}
    >
      {message}
      {repeat.marked ? "\u00A0" : null}
    </span>
  );
}
