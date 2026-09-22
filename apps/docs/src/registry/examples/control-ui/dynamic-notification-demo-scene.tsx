import type { ComponentProps } from "react";
import { Button } from "@/components/control-ui/ui/button";

export function DynamicNotificationDemoBackdrop() {
  return (
    <img
      aria-hidden="true"
      data-dn-capture-backdrop
      alt=""
      className="pointer-events-none absolute inset-0 z-0 size-full select-none object-cover"
      src="/dynamic-notification/sequoia-sunrise.png"
    />
  );
}

const lightOnPhoto = {
  "--cui-button-background": "oklch(1 0 0 / 0.86)",
  "--cui-button-foreground": "oklch(0.19 0.02 275)",
  "--cui-button-hover-background": "oklch(1 0 0 / 0.94)",
  "--cui-button-hover-foreground": "oklch(0.19 0.02 275)",
  "--cui-button-shadow": "inset 0 0 0 1px oklch(1 0 0 / 0.45), var(--shadow-sm)",
};

export function DynamicNotificationDemoButton(props: Omit<ComponentProps<typeof Button>, "variant" | "size" | "style">) {
  return <Button variant="surface" size="sm" style={lightOnPhoto} {...props} />;
}
