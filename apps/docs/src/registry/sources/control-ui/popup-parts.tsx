"use client";

import { Button, type ButtonProps } from "@/components/control-ui/ui/button";

export type PopupCloseButtonProps = Omit<ButtonProps, "children" | "iconOnly"> & {
  label: string;
};

export function PopupCloseButton({ label, variant = "ghost", size = "xs", ...props }: PopupCloseButtonProps) {
  return (
    <Button data-popup-part="close" variant={variant} size={size} iconOnly {...props}>
      <svg viewBox="0 0 16 16" aria-hidden="true" fill="none">
        <path d="M4 4 12 12M12 4 4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </Button>
  );
}

export function PopupArrowShape() {
  return (
    <svg aria-hidden="true" focusable="false" width="12" height="8" viewBox="0 0 12 8" overflow="visible">
      <path d="M0 7L4 2Q6 0 8 2L12 7L12 8L0 8Z" fill="currentColor" />
    </svg>
  );
}
