"use client";

import type { ComponentProps, RefObject } from "react";
import { caretRectInTextarea, detectTrigger } from "../lib/trigger-detect";
import type { TriggerConfig, TriggerMenuItemData } from "./use-trigger-menu";
import { isComposingKey, useTriggerMenu } from "./use-trigger-menu";

const CLOSE_AFTER_BLUR_MS = 120;

function replaceRange(element: HTMLTextAreaElement, start: number, end: number, text: string) {
  element.focus();
  element.setSelectionRange(start, end);
  // execCommand keeps caret, joins native undo, and fires real `input` event React can hear
  const inserted = document.execCommand("insertText", false, text);
  if (inserted) return;
  const next = element.value.slice(0, start) + text + element.value.slice(end);
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  setter?.call(element, next);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  const caret = start + text.length;
  element.setSelectionRange(caret, caret);
}

export function useTextareaTriggerMenu<Item extends TriggerMenuItemData>(
  ref: RefObject<HTMLTextAreaElement | null>,
  options: { triggers: readonly TriggerConfig<Item>[] },
) {
  const controller = useTriggerMenu<Item>({
    triggers: options.triggers,
    onCommit: (item, trigger, match) => {
      const element = ref.current;
      if (!element) return;
      const mode = trigger.insert ?? "replace";
      const text = mode === "none" ? "" : (trigger.insertText?.(item) ?? `${trigger.char}${item.label} `);
      replaceRange(element, match.start, match.end, text);
      trigger.onSelect?.(item, { char: trigger.char, query: match.query });
    },
  });

  function reportTriggerAtCaret(textarea: HTMLTextAreaElement) {
    const caret = textarea.selectionStart ?? textarea.value.length;
    const chars = options.triggers.map((trigger) => trigger.char);
    const match = detectTrigger(textarea.value.slice(0, caret), chars);
    controller.report(match, match === null ? null : caretRectInTextarea(textarea, match.start));
  }

  function getTextareaProps(props: ComponentProps<"textarea"> = {}): ComponentProps<"textarea"> {
    const { onChange, onKeyDown, onKeyUp, onClick, onBlur, ...textareaProps } = props;

    return {
      ...textareaProps,
      ...controller.inputAria,
      onChange: (event) => {
        onChange?.(event);
        reportTriggerAtCaret(event.currentTarget);
      },
      onKeyDown: (event) => {
        const menuConsumedKey = !isComposingKey(event.nativeEvent) && controller.open && controller.handleKeyDown(event.key);
        if (menuConsumedKey) event.preventDefault();
        onKeyDown?.(event);
      },
      onKeyUp: (event) => {
        onKeyUp?.(event);
        reportTriggerAtCaret(event.currentTarget);
      },
      onClick: (event) => {
        onClick?.(event);
        reportTriggerAtCaret(event.currentTarget);
      },
      onBlur: (event) => {
        onBlur?.(event);
        window.setTimeout(controller.close, CLOSE_AFTER_BLUR_MS);
      },
    };
  }

  return { ...controller, getTextareaProps };
}
