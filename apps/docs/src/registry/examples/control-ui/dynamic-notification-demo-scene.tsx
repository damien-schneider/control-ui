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

export function DynamicNotificationDemoButton(props: Omit<ComponentProps<typeof Button>, "variant" | "size">) {
  return <Button variant="surface" size="sm" {...props} />;
}
