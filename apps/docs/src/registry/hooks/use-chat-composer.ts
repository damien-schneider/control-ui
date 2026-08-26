import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useState } from "react";
import type { FormSubmitEvent } from "@/components/control-ui/control-props";
import type { ChatDensity } from "@/components/control-ui/hooks/use-chat-message";
import type { ChatComposerKnobStyle } from "@/components/control-ui/knob-contracts/chat-composer-knobs";

export type ChatComposerSubmitPayload = {
  value: string;
  clear: () => void;
  mentions?: MentionItem[];
};

export type ChatComposerProps = Omit<ComponentProps<"form">, "onSubmit" | "style"> & {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (payload: ChatComposerSubmitPayload) => void | Promise<void>;
  state?: "idle" | "submitting" | "disabled";
  density?: ChatDensity;
  disabled?: boolean;
  style?: CSSProperties & ChatComposerKnobStyle;
};

export type MentionItem = { id: string; label: string; kind: string };

function useControllableText({
  value,
  defaultValue = "",
  onValueChange,
}: Pick<ChatComposerProps, "value" | "defaultValue" | "onValueChange">) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  function setValue(nextValue: string) {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  return [currentValue, setValue] as const;
}

export function useChatComposer({
  value,
  defaultValue,
  onValueChange,
  onSubmit,
  state = "idle",
  density = "comfortable",
  disabled = false,
  trackSends = false,
}: Pick<ChatComposerProps, "value" | "defaultValue" | "onValueChange" | "onSubmit" | "state" | "density" | "disabled"> & {
  /** Count successful submits — only enabled when something reads counter (send-layer anchor), so idle apps pay no extra state update. */
  trackSends?: boolean;
}) {
  const [inputValue, setInputValue] = useControllableText({ value, defaultValue, onValueChange });
  const [sendCount, setSendCount] = useState(0);
  const normalizedValue = inputValue.trim();
  const isDisabled = disabled || state === "disabled" || state === "submitting";
  const canSubmit = normalizedValue.length > 0 && !isDisabled;
  const isCompact = density === "compact";

  function clear() {
    setInputValue("");
  }

  // shared path: plain textarea via handleSubmit, rich editor calls submit() directly with extras (mentions)
  function submit(extra?: Partial<ChatComposerSubmitPayload>) {
    if (!canSubmit) return;
    if (trackSends) setSendCount((count) => count + 1);
    // onSubmit may return Promise; surface rejected send without unhandled rejection
    Promise.resolve(onSubmit?.({ value: normalizedValue, clear, ...extra })).catch(reportError);
  }

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    submit();
  }

  return {
    value: inputValue,
    setValue: setInputValue,
    normalizedValue,
    state,
    density,
    isCompact,
    isDisabled,
    canSubmit,
    rows: isCompact ? 2 : 4,
    sendCount,
    clear,
    submit,
    handleSubmit,
  };
}
