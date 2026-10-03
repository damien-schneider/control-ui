import type { BaseUIEvent } from "@base-ui/react/types";
import type { PointerEvent } from "react";

export const popupItemFocusProps = {
  onPointerLeave(event: BaseUIEvent<PointerEvent<HTMLElement>>) {
    if (event.pointerType === "touch" || !(event.relatedTarget instanceof Element)) return;
    const nextItem = event.relatedTarget.closest('[role="option"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]');
    const list = event.currentTarget.closest('[role="listbox"], [role="menu"]');
    // Base UI recognizes the next item itself, but not its nested text or icons.
    // Preserve the direct focus handoff instead of clearing and restoring the highlight.
    if (nextItem && list && nextItem.closest('[role="listbox"], [role="menu"]') === list) event.preventBaseUIHandler();
  },
};
