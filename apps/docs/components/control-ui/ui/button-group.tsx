import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import type { ButtonGroupProps, ButtonGroupSeparatorProps, ControlSize } from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Selected controls stay above adjacent focus rings so their shared seams remain visible.
const buttonGroupVariant = cva(
  "inline-flex w-fit items-stretch [&>*]:relative [&>*:focus-within:not([data-active=true])]:z-[1] [&>*[data-active=true]]:z-[2] [&>*[data-active=true]:focus-within]:z-[3]",
  {
    variants: {
      orientation: {
        horizontal: "flex-row [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
        vertical: "flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

export function ButtonGroup({ orientation = "horizontal", className, ...props }: ButtonGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a segmented control is a labelled group, not a fieldset form group.
    <div
      role="group"
      data-control-ui="button-group"
      data-slot="root"
      data-orientation={orientation}
      className={cn(buttonGroupVariant({ orientation }), skinSlot("button-group", "root", { orientation }), className)}
      {...props}
    />
  );
}

// Non-interactive addon label styled to fuse with the group, e.g. a `https://` prefix or unit suffix.
type ButtonGroupTextProps = ComponentProps<"div"> & {
  size?: ControlSize;
};

export function ButtonGroupText({ size = "sm", className, ...props }: ButtonGroupTextProps) {
  return (
    <div
      data-control-ui="button-group"
      data-slot="text"
      data-size={size}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-[var(--radius-control)] border bg-card/72 font-medium text-muted-foreground shadow-sm [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0",
        controlSize({ size }),
        skinSlot("button-group", "text", {}),
        className,
      )}
      {...props}
    />
  );
}

export function ButtonGroupSeparator({ orientation = "vertical", className, ...props }: ButtonGroupSeparatorProps) {
  return (
    <div
      aria-hidden="true"
      data-control-ui="button-group"
      data-slot="separator"
      data-orientation={orientation}
      className={cn("shrink-0 self-stretch bg-border", orientation === "vertical" ? "w-px" : "h-px w-full", className)}
      {...props}
    />
  );
}
