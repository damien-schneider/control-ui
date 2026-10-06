import type { ComponentProps, CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useState } from "react";
import type { UserAskKnobStyle } from "@/components/control-ui/knob-contracts/user-ask-knobs";

export type UserAskAnswers = Record<string, string | string[]>;

export type UserAskProps = Omit<ComponentProps<"section">, "style"> & {
  children?: ReactNode;
  onComplete?: (answers: UserAskAnswers) => void;
  onDismiss?: () => void;
  questionStatusLabel?: (current: number, total: number, title: string) => string;
  style?: CSSProperties & UserAskKnobStyle;
};

export type UserAskQuestionEntry = {
  key: string;
  id: string;
  title: string;
  multiple?: boolean;
  defaultValues?: string[];
};

export type UserAskOptionEntry = {
  key: string;
  value: string;
  disabled?: boolean;
  /** Freeform options resolve to user's typed text instead of `value`. */
  freeform?: boolean;
};

function upsert<Entry extends { key: string }>(entries: Entry[], entry: Entry) {
  const index = entries.findIndex((existing) => existing.key === entry.key);
  if (index === -1) return [...entries, entry];
  if (JSON.stringify(entries[index]) === JSON.stringify(entry)) return entries;
  const next = [...entries];
  next[index] = entry;
  return next;
}

const arrowDeltas: Record<string, number | undefined> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

export function useUserAsk({ onComplete, onDismiss }: Pick<UserAskProps, "onComplete" | "onDismiss">) {
  const [questions, setQuestions] = useState<UserAskQuestionEntry[]>([]);
  const [optionsByQuestion, setOptionsByQuestion] = useState<Record<string, UserAskOptionEntry[]>>({});
  // Explicit picks by option registration key; question's defaultValue is DERIVED in selectionFor, never copied here.
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [freeformTexts, setFreeformTexts] = useState<Record<string, string>>({});
  const [requestedIndex, setRequestedIndex] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);

  // useState-once keeps identities stable; register upserts IN PLACE (prop change must not reorder numbering)
  // and unregister runs only at part unmount — combined effect cleanup would move updated entries to end.
  const [registerQuestion] = useState(() => (entry: UserAskQuestionEntry) => {
    setQuestions((previous) => upsert(previous, entry));
  });

  const [unregisterQuestion] = useState(() => (key: string) => {
    setQuestions((previous) => previous.filter((question) => question.key !== key));
  });

  const [registerOption] = useState(() => (questionId: string, entry: UserAskOptionEntry) => {
    setOptionsByQuestion((previous) => ({ ...previous, [questionId]: upsert(previous[questionId] ?? [], entry) }));
  });

  const [unregisterOption] = useState(() => (questionId: string, key: string) => {
    setOptionsByQuestion((previous) => ({
      ...previous,
      [questionId]: (previous[questionId] ?? []).filter((option) => option.key !== key),
    }));
  });

  const activeIndex = questions.length === 0 ? 0 : Math.min(requestedIndex, questions.length - 1);
  const activeQuestion = questions[activeIndex];

  function optionsFor(questionId: string) {
    return optionsByQuestion[questionId] ?? [];
  }

  function allowsMultiple(questionId: string) {
    return questions.find((question) => question.id === questionId)?.multiple === true;
  }

  function selectedKeysFor(questionId: string) {
    const explicit = selections[questionId];
    if (explicit) return explicit;
    const defaults = questions.find((question) => question.id === questionId)?.defaultValues;
    if (defaults === undefined) return [];
    return optionsFor(questionId)
      .filter((option) => !option.freeform && defaults.includes(option.value))
      .map((option) => option.key);
  }

  function selectionFor(questionId: string) {
    return selectedKeysFor(questionId)[0];
  }

  function isSelected(questionId: string, optionKey: string) {
    return selectedKeysFor(questionId).includes(optionKey);
  }

  function select(questionId: string, optionKey: string) {
    if (!allowsMultiple(questionId)) {
      setSelections((previous) => ({ ...previous, [questionId]: [optionKey] }));
      return;
    }
    const derived = selectedKeysFor(questionId);
    setSelections((previous) => {
      const current = previous[questionId] ?? derived;
      const next = current.includes(optionKey) ? current.filter((entry) => entry !== optionKey) : [...current, optionKey];
      return { ...previous, [questionId]: next };
    });
  }

  function freeformTextFor(questionId: string) {
    return freeformTexts[questionId] ?? "";
  }

  function setFreeformText(questionId: string, text: string) {
    setFreeformTexts((previous) => ({ ...previous, [questionId]: text }));
  }

  function answerFor(questionId: string) {
    const options = optionsFor(questionId);
    const resolve = (optionKey: string) => {
      const option = options.find((entry) => entry.key === optionKey);
      if (!option) return undefined;
      if (!option.freeform) return option.value;
      const text = freeformTextFor(questionId).trim();
      return text.length > 0 ? text : undefined;
    };
    const values = selectedKeysFor(questionId)
      .map(resolve)
      .filter((value): value is string => value !== undefined);
    if (!allowsMultiple(questionId)) return values[0];
    return values.length > 0 ? values : undefined;
  }

  const canContinue = activeQuestion !== undefined && answerFor(activeQuestion.id) !== undefined;
  const isLastQuestion = activeIndex === questions.length - 1;

  function goTo(index: number) {
    const targetIndex = Math.max(0, Math.min(index, questions.length - 1));
    if (targetIndex !== activeIndex) setHasNavigated(true);
    setRequestedIndex(targetIndex);
  }

  function resolveAnswers() {
    const answers: UserAskAnswers = {};
    for (const question of questions) {
      const answer = answerFor(question.id);
      if (answer !== undefined) answers[question.id] = answer;
    }
    return answers;
  }

  function advance() {
    if (!canContinue) return;
    if (isLastQuestion) onComplete?.(resolveAnswers());
    else goTo(activeIndex + 1);
  }

  function dismiss() {
    onDismiss?.();
  }

  function isTabStop(questionId: string, optionKey: string) {
    if (allowsMultiple(questionId)) return true;
    const selectedKey = selectionFor(questionId);
    if (selectedKey !== undefined) return selectedKey === optionKey;
    return optionsFor(questionId).find((option) => !option.disabled)?.key === optionKey;
  }

  function selectDigit(digit: number) {
    if (!activeQuestion) return;
    const option = optionsFor(activeQuestion.id)[digit - 1];
    if (option && !option.disabled) select(activeQuestion.id, option.key);
  }

  function moveActiveOption(event: KeyboardEvent<HTMLElement>, delta: number) {
    if (!activeQuestion) return;
    const group = event.currentTarget.querySelector('[data-slot="question"][data-active]');
    const rows = [...(group?.querySelectorAll<HTMLElement>('[data-slot="option"]:not([disabled])') ?? [])];
    if (rows.length === 0) return;
    const focused = rows.findIndex((candidate) => candidate.contains(document.activeElement));
    let start = focused;
    if (focused === -1) start = delta > 0 ? -1 : 0;
    const row = rows[(start + delta + rows.length) % rows.length];
    const target = row?.matches("button, input") ? row : row?.querySelector<HTMLElement>("input, button");
    target?.focus();
    if (!allowsMultiple(activeQuestion.id) && target?.matches("button")) target.click();
  }

  function handleEnter(event: KeyboardEvent<HTMLElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.target instanceof Element && event.target.closest('button:not([role="radio"]):not([role="checkbox"]), a[href]')) return;
    event.preventDefault();
    advance();
  }

  function handleOptionKey(event: KeyboardEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest("input, textarea, [contenteditable]")) return;
    const delta = arrowDeltas[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      moveActiveOption(event, delta);
      return;
    }
    if (/^[1-9]$/.test(event.key)) {
      // preventDefault: selecting freeform option moves focus into its input before keypress — without this digit would be typed there.
      event.preventDefault();
      selectDigit(Number(event.key));
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
    } else if (event.key === "Enter") {
      handleEnter(event);
    } else {
      handleOptionKey(event);
    }
  }

  return {
    questions,
    activeIndex,
    activeQuestion,
    hasNavigated,
    canContinue,
    isLastQuestion,
    registerQuestion,
    unregisterQuestion,
    registerOption,
    unregisterOption,
    optionsFor,
    allowsMultiple,
    selectionFor,
    isSelected,
    isTabStop,
    select,
    freeformTextFor,
    setFreeformText,
    answerFor,
    resolveAnswers,
    goTo,
    advance,
    dismiss,
    handleKeyDown,
  };
}
