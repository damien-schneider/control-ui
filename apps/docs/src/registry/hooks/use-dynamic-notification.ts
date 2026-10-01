import type { ComponentProps, CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import type { FormSubmitEvent, OpenChangeEventDetails, OpenChangeReason } from "@/components/control-ui/control-props";
import type { DynamicNotificationKnobStyle } from "@/components/control-ui/knob-contracts/dynamic-notification-knobs";

export type DynamicNotificationVariant = "surface" | "glass" | "liquid";

export type DynamicNotificationReplyPayload = {
  value: string;
  clear: () => void;
};

export type DynamicNotificationProps = Omit<ComponentProps<"div">, "onChange" | "style"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  loading?: boolean;
  replyValue?: string;
  defaultReplyValue?: string;
  onReplyValueChange?: (value: string) => void;
  onReply?: (payload: DynamicNotificationReplyPayload) => void | Promise<void>;
  variant?: DynamicNotificationVariant;
  disabled?: boolean;
  thinkingLabel?: string;
  replyErrorLabel?: string;
  style?: CSSProperties & DynamicNotificationKnobStyle;
};

// No Base UI primitive backs island, so details are hand-built to same shape every other popup emits.
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
  setOpen: (nextOpen: boolean, reason: OpenChangeReason, event: Event, trigger?: Element) => boolean;
  reply: string;
  setReply: (nextValue: string) => void;
  normalizedReply: string;
  canSubmit: boolean;
  replyPending: boolean;
  replyFailed: boolean;
  clear: () => void;
  submitReply: () => Promise<void>;
  handleReplySubmit: (event: FormSubmitEvent) => void;
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
  const [replyPending, setReplyPending] = useState(false);
  const [replyFailed, setReplyFailed] = useState(false);
  const replyInFlight = useRef(false);
  const canSubmit = normalizedReply.length > 0 && !disabled && !replyPending;

  // Stable actions keep split contexts isolated when installed without React Compiler.
  const setOpen = useMemo(
    () => (nextOpen: boolean, reason: OpenChangeReason, event: Event, trigger?: Element) => {
      if (disabled || nextOpen === isOpen) return false;
      const details = createOpenChangeEventDetails(reason, event, trigger);
      onOpenChange?.(nextOpen, details);
      if (details.isCanceled) return false;
      if (!isControlled) setInternalOpen(nextOpen);
      return true;
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
    () => async () => {
      if (!canSubmit || replyInFlight.current) return;
      replyInFlight.current = true;
      setReplyPending(true);
      setReplyFailed(false);
      try {
        await onReply?.({ value: normalizedReply, clear });
      } catch {
        setReplyFailed(true);
      } finally {
        replyInFlight.current = false;
        setReplyPending(false);
      }
    },
    [canSubmit, clear, normalizedReply, onReply],
  );

  const handleReplySubmit = useMemo(
    () => (event: FormSubmitEvent) => {
      event.preventDefault();
      void submitReply();
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
    replyPending,
    replyFailed,
    clear,
    submitReply,
    handleReplySubmit,
  };
}
