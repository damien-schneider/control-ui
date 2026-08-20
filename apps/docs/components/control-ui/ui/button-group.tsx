import { cva } from "class-variance-authority";
import type { ButtonGroupProps, ButtonGroupSeparatorProps, ButtonGroupTextProps } from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";

// selected controls sit above adjacent focus rings, keeping their shared seams visible
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
      data-control-family="button-group"
      data-slot="root"
      data-orientation={orientation}
      className={cn(buttonGroupVariant({ orientation }), className)}
      {...props}
    />
  );
}

export function ButtonGroupText({ size = "sm", className, ...props }: ButtonGroupTextProps) {
  return (
    <div
      data-control-ui="button-group"
      data-control-family="button-group"
      data-slot="text"
      data-size={size}
      className={cn(
        "inline-flex items-center whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0",
        controlSize({ size }),
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
      data-control-family="button-group"
      data-slot="separator"
      data-orientation={orientation}
      className={cn("shrink-0 self-stretch", orientation === "vertical" ? "w-px" : "h-px w-full", className)}
      {...props}
    />
  );
}
