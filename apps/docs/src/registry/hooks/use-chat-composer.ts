import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useState } from "react";
import type { FormSubmitEvent } from "@/components/control-ui/control-props";
import type { ChatDensity } from "@/components/control-ui/hooks/use-chat-message";
import { isComposingKey } from "@/components/control-ui/hooks/use-trigger-menu";
import type { ChatComposerKnobStyle } from "@/components/control-ui/knob-contracts/chat-composer-knobs";

export type ChatComposerSubmitPayload = {
  value: string;
  clear: () => void;
  mentions?: MentionItem[];
};

export type ChatComposerSubmitKey = "enter" | "mod-enter";

export type ChatComposerProps = Omit<ComponentProps<"form">, "onSubmit" | "style"> & {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (payload: ChatComposerSubmitPayload) => void | Promise<void>;
  state?: "idle" | "submitting" | "disabled";
  density?: ChatDensity;
  disabled?: boolean;
  /** Let an empty message send, for composers where an attachment or recording carries the turn. */
  allowEmptySubmit?: boolean;
  submitKey?: ChatComposerSubmitKey;
  style?: CSSProperties & ChatComposerKnobStyle;
};

export type MentionItem = { id: string; label: string; kind: string };

type ComposerKeyEvent = {
  key: string;
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  defaultPrevented: boolean;
  nativeEvent: { isComposing: boolean; keyCode: number };
  preventDefault: () => void;
};

type InsertText = (text: string) => void;

export type RegisterInsertionTarget = (insert: InsertText) => () => void;

export type ChatComposerController = {
  value: string;
  setValue: (value: string) => void;
  normalizedValue: string;
  state: NonNullable<ChatComposerProps["state"]>;
  density: ChatDensity;
  submitKey: ChatComposerSubmitKey;
  isCompact: boolean;
  isDisabled: boolean;
  isLocked: boolean;
  canSubmit: boolean;
  rows: number;
  sendCount: number;
  clear: () => void;
  submit: (extra?: Partial<ChatComposerSubmitPayload>) => void;
  handleSubmit: (event: FormSubmitEvent) => void;
  handleKeyDown: (event: ComposerKeyEvent) => void;
  insertText: InsertText;
  registerInsertionTarget: RegisterInsertionTarget;
};

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
  allowEmptySubmit = false,
  submitKey = "enter",
  trackSends = false,
}: Pick<
  ChatComposerProps,
  "value" | "defaultValue" | "onValueChange" | "onSubmit" | "state" | "density" | "disabled" | "allowEmptySubmit" | "submitKey"
> & {
  /** Count successful submits — only enabled when something reads counter (send-layer anchor), so idle apps pay no extra state update. */
  trackSends?: boolean;
}): ChatComposerController {
  const [inputValue, setInputValue] = useControllableText({ value, defaultValue, onValueChange });
  const [sendCount, setSendCount] = useState(0);
  const [insertion] = useState(() => {
    let target: InsertText | null = null;
    const register: RegisterInsertionTarget = (insert) => {
      target = insert;
      return () => {
        if (target === insert) target = null;
      };
    };
    return { register, current: () => target };
  });
  const normalizedValue = inputValue.trim();
  const isDisabled = disabled || state === "disabled";
  const isLocked = state === "submitting";
  const canSubmit = (normalizedValue.length > 0 || allowEmptySubmit) && !isDisabled && !isLocked;
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

  // same contract as the rich editor keymap: the submit key sends, ⌘/Ctrl+Enter always sends, Shift+Enter breaks the line
  function handleKeyDown(event: ComposerKeyEvent) {
    if (event.defaultPrevented || event.key !== "Enter" || event.shiftKey || isComposingKey(event.nativeEvent)) return;
    const modifierHeld = event.metaKey || event.ctrlKey;
    if (submitKey === "mod-enter" && !modifierHeld) return;
    event.preventDefault();
    submit();
  }

  function insertText(text: string) {
    if (isDisabled || isLocked) return;
    const insertAtCaret = insertion.current();
    if (insertAtCaret) insertAtCaret(text);
    else setInputValue(`${inputValue}${text}`);
  }

  return {
    value: inputValue,
    setValue: setInputValue,
    normalizedValue,
    state,
    density,
    submitKey,
    isCompact,
    isDisabled,
    isLocked,
    canSubmit,
    rows: isCompact ? 2 : 4,
    sendCount,
    clear,
    submit,
    handleSubmit,
    handleKeyDown,
    insertText,
    registerInsertionTarget: insertion.register,
  };
}
