import type { MouseEvent } from "react";

const ownPressTargets =
  "input, textarea, select, button, a, label, summary, [role='button'], [role='combobox'], [role='slider'], [tabindex], [contenteditable], [data-slot='scrub-area']";

// A text field's padding, addons, and toolbars belong to it: pressing them focuses its text control, as pressing an input's own padding does.
export function focusTextControlOnPress(event: MouseEvent<HTMLElement>, control: HTMLElement | null) {
  if (event.defaultPrevented || event.button !== 0 || !control || control.matches(":disabled")) return;
  // React bubbles presses from portalled popups through here; only presses inside the field's own box count.
  if (!(event.target instanceof Element) || !event.currentTarget.contains(event.target)) return;
  const pressed = event.target.closest(ownPressTargets);
  if (pressed && event.currentTarget.contains(pressed)) return;
  event.preventDefault();
  control.focus();
}
