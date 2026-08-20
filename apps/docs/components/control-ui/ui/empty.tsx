import type { ComponentProps, CSSProperties } from "react";
import type {
  EmptyContentProps,
  EmptyDescriptionProps,
  EmptyMediaProps,
  EmptyProps,
  EmptyTitleProps,
} from "@/components/control-ui/contracts";
import type { EmptyKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";

export function Empty({ className, ...props }: EmptyProps) {
  return (
    <div
      data-control-ui="empty"
      data-control-family="empty"
      data-slot="root"
      className={cn("flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-6", className)}
      {...props}
    />
  );
}

export function EmptyHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & EmptyKnobStyle }) {
  return (
    <div
      data-control-ui="empty"
      data-control-family="empty"
      data-slot="header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  );
}

export function EmptyMedia({ className, ...props }: EmptyMediaProps) {
  return (
    <div
      data-control-ui="empty"
      data-control-family="empty"
      data-slot="media"
      className={cn("mb-2 flex size-10 shrink-0 items-center justify-center [&>svg]:size-5 [&>svg]:shrink-0", className)}
      {...props}
    />
  );
}

export function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  return <div data-control-ui="empty" data-control-family="empty" data-slot="title" className={className} {...props} />;
}

export function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  return <p data-control-ui="empty" data-control-family="empty" data-slot="description" className={className} {...props} />;
}

export function EmptyContent({ className, ...props }: EmptyContentProps) {
  return (
    <div
      data-control-ui="empty"
      data-control-family="empty"
      data-slot="content"
      className={cn("flex w-full max-w-sm flex-col items-center justify-center gap-2", className)}
      {...props}
    />
  );
}
