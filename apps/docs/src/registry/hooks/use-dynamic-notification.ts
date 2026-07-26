import type { SubmitEvent } from "react";
import { useMemo, useState } from "react";

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

  const setValue = useMemo(
    () => (nextValue: string) => {
      if (!isControlled) setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  return [currentValue, setValue] as const;
}

export type DynamicNotificationController = {
  open: boolean;
  disabled: boolean;
  setOpen: (nextOpen: boolean, reason: OpenChangeReason, event: Event, trigger?: Element) => void;
  reply: string;
  setReply: (nextValue: string) => void;
  normalizedReply: string;
  canSubmit: boolean;
  clear: () => void;
  submitReply: () => void;
  handleReplySubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

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
>): DynamicNotificationController {
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

  // Stable actions keep split contexts isolated when installed without React Compiler.
  const setOpen = useMemo(
    () => (nextOpen: boolean, reason: OpenChangeReason, event: Event, trigger?: Element) => {
      if (disabled || nextOpen === isOpen) return;
      const details = createOpenChangeEventDetails(reason, event, trigger);
      onOpenChange?.(nextOpen, details);
      if (details.isCanceled) return;
      if (!isControlled) setInternalOpen(nextOpen);
    },
    [disabled, isControlled, isOpen, onOpenChange],
  );

  const clear = useMemo(
    () => () => {
      setReply("");
    },
    [setReply],
  );

  const submitReply = useMemo(
    () => () => {
      if (!canSubmit) return;
      void onReply?.({ value: normalizedReply, clear });
    },
    [canSubmit, clear, normalizedReply, onReply],
  );

  const handleReplySubmit = useMemo(
    () => (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      submitReply();
    },
    [submitReply],
  );

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
