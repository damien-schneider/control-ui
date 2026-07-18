import type { SubmitEvent } from "react";
import { useState } from "react";

import type { DynamicNotificationProps, OpenChangeEventDetails, OpenChangeReason } from "../contracts";

// Hand-built (no Base UI primitive backs the island) but shaped exactly like Base UI's details so
// callers get the one onOpenChange contract used across every popup-style component (contracts.ts).
function createOpenChangeEventDetails(reason: OpenChangeReason, event: Event, trigger: Element | undefined): OpenChangeEventDetails {
  let canceled = false;
  let propagationAllowed = false;
  return {
    reason,
    event,
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      propagationAllowed = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
    trigger,
  };
}

function useControllableText({
  value,
  defaultValue = "",
  onValueChange,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  function setValue(nextValue: string) {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  return [currentValue, setValue] as const;
}

export function useDynamicNotification({
  open,
  defaultOpen = false,
  onOpenChange,
  replyValue,
  defaultReplyValue,
  onReplyValueChange,
  onReply,
  disabled = false,
}: Pick<
  DynamicNotificationProps,
  "open" | "defaultOpen" | "onOpenChange" | "replyValue" | "defaultReplyValue" | "onReplyValueChange" | "onReply" | "disabled"
>) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [reply, setReply] = useControllableText({
    value: replyValue,
    defaultValue: defaultReplyValue,
    onValueChange: onReplyValueChange,
  });
  const normalizedReply = reply.trim();
  const canSubmit = normalizedReply.length > 0 && !disabled;

  function setOpen(nextOpen: boolean, reason: OpenChangeReason, event: Event, trigger?: Element) {
    if (disabled || nextOpen === isOpen) return;
    const details = createOpenChangeEventDetails(reason, event, trigger);
    onOpenChange?.(nextOpen, details);
    if (details.isCanceled) return;
    if (!isControlled) setInternalOpen(nextOpen);
  }

  function clear() {
    setReply("");
  }

  function submitReply() {
    if (!canSubmit) return;
    void onReply?.({ value: normalizedReply, clear });
  }

  function handleReplySubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    submitReply();
  }

  return {
    open: isOpen,
    disabled,
    setOpen,
    reply,
    setReply,
    normalizedReply,
    canSubmit,
    clear,
    submitReply,
    handleReplySubmit,
  };
}
