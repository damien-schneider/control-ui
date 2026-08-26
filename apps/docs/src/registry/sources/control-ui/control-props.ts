import type { ComponentProps, ReactElement } from "react";

// Tracks the consumer's React types: form onSubmit is FormEvent-based before React 19.2 and SubmitEvent-based after.
export type FormSubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

export type ControlledChoice<TValue extends string = string> = {
  value?: TValue;
  defaultValue?: NoInfer<TValue>;
  onValueChange?: (value: TValue) => void;
};

export type ControlledMultiChoice<TValue extends string = string> = {
  value?: TValue[];
  defaultValue?: NoInfer<TValue>[];
  onValueChange?: (value: TValue[]) => void;
};

export type RenderProp<Props, State extends Record<string, unknown> = Record<string, unknown>> =
  | ReactElement
  | ((props: Props, state: State) => ReactElement<unknown>);

export type OpenChangeReason =
  | "trigger-hover"
  | "trigger-focus"
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "close-watcher"
  | "close-press"
  | "focus-out"
  | "list-navigation"
  | "item-press"
  | "sibling-open"
  | "cancel-open"
  | "input-change"
  | "input-clear"
  | "input-press"
  | "clear-press"
  | "chip-remove-press"
  | "imperative-action"
  | "swipe"
  | "none";

export type OpenChangeEventDetails = {
  reason: OpenChangeReason;
  event: Event;
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
  trigger: Element | undefined;
};

export type SelectionIndicator = "none" | "slide";

// Read server-side (RSC layouts) and written client-side; lives here because ui/sidebar.tsx is "use client".
export const SIDEBAR_COOKIE_NAME = "sidebar_state";
