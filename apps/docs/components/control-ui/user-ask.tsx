"use client";

import { Check, ChevronLeft, ChevronRight, PencilLine } from "lucide-react";
import type { ChangeEvent, ComponentProps, MouseEvent } from "react";
import { createContext, useContext, useEffect, useId, useRef } from "react";

import type { UserAskProps } from "@/components/control-ui/contracts";
import { useUserAsk } from "@/components/control-ui/hooks/use-user-ask";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import { Kbd } from "@/components/control-ui/ui/kbd";

type UserAskContextValue = ReturnType<typeof useUserAsk> & {
  titleId: string;
};

const UserAskContext = createContext<UserAskContextValue | null>(null);

function useUserAskContext() {
  const context = useContext(UserAskContext);
  if (!context) throw new Error("UserAsk compound components must be rendered inside <UserAsk>.");
  return context;
}

type UserAskQuestionContextValue = {
  id: string;
  active: boolean;
};

const UserAskQuestionContext = createContext<UserAskQuestionContextValue | null>(null);

function useUserAskQuestionContext() {
  const context = useContext(UserAskQuestionContext);
  if (!context) throw new Error("UserAsk options must be rendered inside <UserAskQuestion>.");
  return context;
}

export function UserAsk({ onComplete, onDismiss, autoFocus = false, className, children, ...props }: UserAskProps) {
  const ask = useUserAsk({ onComplete, onDismiss });
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  // Native autofocus only applies at document load; the panel mounts mid-conversation, so focus imperatively.
  useEffect(() => {
    if (autoFocus) panelRef.current?.focus();
  }, [autoFocus]);

  // Hiding a question blurs its focused descendants (e.g. the freeform input) to <body>, killing the
  // Enter/Escape flow — pull focus back to the panel whenever the active question changes. The browser
  // may not have processed that blur yet at effect time, so test visibility, not just containment.
  const lastActiveIndex = useRef(ask.activeIndex);
  useEffect(() => {
    if (lastActiveIndex.current === ask.activeIndex) return;
    lastActiveIndex.current = ask.activeIndex;
    const panel = panelRef.current;
    const active = document.activeElement;
    const activeIsUsable = active instanceof HTMLElement && panel?.contains(active) && active.checkVisibility();
    if (panel && !activeIsUsable) panel.focus();
  }, [ask.activeIndex]);

  return (
    <UserAskContext.Provider value={{ ...ask, titleId }}>
      {/* fx anchor candidate: "user-ask:panel-layer" */}
      <section
        ref={panelRef}
        data-control-ui="user-ask"
        data-slot="root"
        data-surface="panel"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={ask.handleKeyDown}
        className={cn(
          "relative w-full rounded-field border bg-card/90 p-3 text-body shadow-md ring-1 ring-foreground/4 outline-none backdrop-blur",
          // @starting-style entrance: the panel swaps in for the composer, so it rises into place with no JS choreography.
          "transition-[opacity,translate] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] starting:translate-y-2 starting:opacity-0",
          skinSlot("user-ask", "root", {}),
          className,
        )}
        {...props}
      >
        {children}
      </section>
    </UserAskContext.Provider>
  );
}

export type UserAskHeaderProps = ComponentProps<"header">;

export function UserAskHeader({ className, ...props }: UserAskHeaderProps) {
  return (
    <header
      data-control-ui="user-ask"
      data-slot="header"
      className={cn("flex items-start justify-between gap-3 px-1 pb-2", skinSlot("user-ask", "header", {}), className)}
      {...props}
    />
  );
}

export type UserAskTitleProps = ComponentProps<"h3">;

export function UserAskTitle({ className, children, ...props }: UserAskTitleProps) {
  const ask = useUserAskContext();

  return (
    <h3
      id={ask.titleId}
      data-control-ui="user-ask"
      data-slot="title"
      className={cn("text-sm font-semibold text-foreground", skinSlot("user-ask", "title", {}), className)}
      {...props}
    >
      {children ?? ask.activeQuestion?.title}
    </h3>
  );
}

export type UserAskPaginationProps = ComponentProps<"div">;

export function UserAskPagination({ className, ...props }: UserAskPaginationProps) {
  const ask = useUserAskContext();
  if (ask.questions.length <= 1) return null;

  return (
    <div
      data-control-ui="user-ask"
      data-slot="pagination"
      className={cn("flex shrink-0 items-center gap-1 text-micro text-muted-foreground", skinSlot("user-ask", "pagination", {}), className)}
      {...props}
    >
      <Button
        type="button"
        variant="quiet"
        size="xs"
        aria-label="Previous question"
        disabled={ask.activeIndex === 0}
        onClick={() => ask.goTo(ask.activeIndex - 1)}
      >
        <ChevronLeft aria-hidden="true" className="size-3.5" />
      </Button>
      <span className="tabular-nums">
        {ask.activeIndex + 1} of {ask.questions.length}
      </span>
      <Button
        type="button"
        variant="quiet"
        size="xs"
        aria-label="Next question"
        disabled={ask.isLastQuestion}
        onClick={() => ask.goTo(ask.activeIndex + 1)}
      >
        <ChevronRight aria-hidden="true" className="size-3.5" />
      </Button>
    </div>
  );
}

export type UserAskQuestionProps = Omit<ComponentProps<"div">, "title"> & {
  id: string;
  title: string;
  /** Pre-selects the option carrying this value (e.g. the recommended one) until the user picks another. */
  defaultValue?: string;
};

export function UserAskQuestion({ id, title, defaultValue, className, children, ...props }: UserAskQuestionProps) {
  const ask = useUserAskContext();
  const key = useId();
  const active = ask.activeQuestion?.key === key;

  useEffect(() => ask.registerQuestion({ key, id, title, defaultValue }), [ask.registerQuestion, key, id, title, defaultValue]);
  useEffect(() => () => ask.unregisterQuestion(key), [ask.unregisterQuestion, key]);

  return (
    <UserAskQuestionContext.Provider value={{ id, active }}>
      {/* Inactive questions stay mounted (hidden) so their registrations keep pagination and answers alive. */}
      <div
        role="radiogroup"
        aria-labelledby={active ? ask.titleId : undefined}
        hidden={!active}
        data-control-ui="user-ask"
        data-slot="question"
        data-active={active ? "" : undefined}
        className={cn("flex flex-col gap-0.5", skinSlot("user-ask", "question", { active }), className)}
        {...props}
      >
        {children}
      </div>
    </UserAskQuestionContext.Provider>
  );
}

type UserAskOptionContextValue = {
  selected: boolean;
  recommended: boolean;
};

const UserAskOptionContext = createContext<UserAskOptionContextValue | null>(null);

function useUserAskOptionContext() {
  const context = useContext(UserAskOptionContext);
  if (!context) throw new Error("UserAskOption parts must be rendered inside <UserAskOption>.");
  return context;
}

const optionRowClasses = cn(
  "grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-2.5 rounded-[var(--radius-popup-item)] px-2 py-1.5 text-left text-sm",
  "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
  "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
);

function optionIndicatorClasses(selected: boolean) {
  return cn(
    "mt-px inline-flex size-5 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-micro font-medium tabular-nums",
    selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
    skinSlot("user-ask", "option-indicator", { selected }),
  );
}

export type UserAskOptionProps = Omit<ComponentProps<"button">, "value"> & {
  value: string;
  recommended?: boolean;
};

export function UserAskOption({
  value,
  recommended = false,
  disabled = false,
  className,
  children,
  onClick,
  ...props
}: UserAskOptionProps) {
  const ask = useUserAskContext();
  const question = useUserAskQuestionContext();
  const key = useId();

  useEffect(() => ask.registerOption(question.id, { key, value, disabled }), [ask.registerOption, question.id, key, value, disabled]);
  useEffect(() => () => ask.unregisterOption(question.id, key), [ask.unregisterOption, question.id, key]);

  const index = ask.optionsFor(question.id).findIndex((entry) => entry.key === key);
  const selected = ask.isSelected(question.id, key);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) ask.select(question.id, key);
  }

  return (
    <UserAskOptionContext.Provider value={{ selected, recommended }}>
      {/* biome-ignore lint/a11y/useSemanticElements: WAI-ARIA radio pattern on a rich multi-line row; a native input cannot carry the indicator/label/description anatomy. */}
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={disabled}
        data-control-ui="user-ask"
        data-slot="option"
        data-selected={selected ? "" : undefined}
        data-recommended={recommended ? "" : undefined}
        onClick={handleClick}
        className={cn(
          optionRowClasses,
          "disabled:cursor-not-allowed disabled:opacity-50",
          selected && "bg-muted/70",
          skinSlot("user-ask", "option", { selected, disabled }),
          className,
        )}
        {...props}
      >
        <span aria-hidden="true" data-control-ui="user-ask" data-slot="option-indicator" className={optionIndicatorClasses(selected)}>
          {selected ? <Check className="size-3" /> : index + 1}
        </span>
        <span className="min-w-0">{children}</span>
      </button>
    </UserAskOptionContext.Provider>
  );
}

export type UserAskOptionLabelProps = ComponentProps<"span">;

export function UserAskOptionLabel({ className, children, ...props }: UserAskOptionLabelProps) {
  const option = useUserAskOptionContext();

  return (
    <span
      data-control-ui="user-ask"
      data-slot="option-label"
      className={cn("block font-medium text-foreground", skinSlot("user-ask", "option-label", {}), className)}
      {...props}
    >
      {children}
      {option.recommended ? <span className="font-normal text-muted-foreground"> (Recommended)</span> : null}
    </span>
  );
}

export type UserAskOptionDescriptionProps = ComponentProps<"span">;

export function UserAskOptionDescription({ className, ...props }: UserAskOptionDescriptionProps) {
  return (
    <span
      data-control-ui="user-ask"
      data-slot="option-description"
      className={cn("block pt-0.5 text-meta font-normal text-muted-foreground", skinSlot("user-ask", "option-description", {}), className)}
      {...props}
    />
  );
}

export type UserAskOptionInputProps = Omit<ComponentProps<"input">, "value"> & {
  /** Row label while unselected (the option's "Other" affordance). */
  label?: string;
};

export function UserAskOptionInput({
  label = "Other",
  placeholder = "Type your own answer",
  disabled = false,
  className,
  onChange,
  ...props
}: UserAskOptionInputProps) {
  const ask = useUserAskContext();
  const question = useUserAskQuestionContext();
  const key = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => ask.registerOption(question.id, { key, value: "", disabled, freeform: true }),
    [ask.registerOption, question.id, key, disabled],
  );
  useEffect(() => () => ask.unregisterOption(question.id, key), [ask.unregisterOption, question.id, key]);

  const index = ask.optionsFor(question.id).findIndex((entry) => entry.key === key);
  const selected = ask.isSelected(question.id, key);

  // Digits/arrows/click all land here; move the caret in so typing starts immediately.
  useEffect(() => {
    if (selected && question.active) inputRef.current?.focus();
  }, [selected, question.active]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    if (!event.defaultPrevented) ask.setFreeformText(question.id, event.currentTarget.value);
  }

  if (!selected) {
    return (
      // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA radio pattern on a rich row; selecting it swaps in the freeform input.
      <button
        type="button"
        role="radio"
        aria-checked={false}
        disabled={disabled}
        data-control-ui="user-ask"
        data-slot="option"
        data-freeform=""
        onClick={() => ask.select(question.id, key)}
        className={cn(
          optionRowClasses,
          "disabled:cursor-not-allowed disabled:opacity-50",
          skinSlot("user-ask", "option", { selected, disabled }),
          className,
        )}
      >
        <span aria-hidden="true" data-control-ui="user-ask" data-slot="option-indicator" className={optionIndicatorClasses(false)}>
          {index + 1}
        </span>
        <span className="min-w-0 text-muted-foreground">{label}</span>
      </button>
    );
  }

  return (
    <div
      data-control-ui="user-ask"
      data-slot="option"
      data-selected=""
      data-freeform=""
      className={cn(optionRowClasses, "bg-muted/70", skinSlot("user-ask", "option", { selected, disabled }), className)}
    >
      <span aria-hidden="true" data-control-ui="user-ask" data-slot="option-indicator" className={optionIndicatorClasses(true)}>
        <PencilLine className="size-3" />
      </span>
      <input
        {...props}
        ref={inputRef}
        type="text"
        aria-label={label}
        data-control-ui="user-ask"
        data-slot="option-input"
        value={ask.freeformTextFor(question.id)}
        onChange={handleChange}
        placeholder={placeholder}
        className="min-w-0 bg-transparent font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
      />
    </div>
  );
}

export type UserAskFooterProps = ComponentProps<"footer">;

export function UserAskFooter({ className, ...props }: UserAskFooterProps) {
  return (
    <footer
      data-control-ui="user-ask"
      data-slot="footer"
      className={cn("flex items-center justify-end gap-2 px-1 pt-3", skinSlot("user-ask", "footer", {}), className)}
      {...props}
    />
  );
}

export type UserAskDismissProps = ComponentProps<typeof Button>;

export function UserAskDismiss({ className, children, onClick, ...props }: UserAskDismissProps) {
  const ask = useUserAskContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) ask.dismiss();
  }

  return (
    <Button
      data-control-ui="user-ask"
      data-slot="dismiss"
      type="button"
      variant="quiet"
      size="xs"
      onClick={handleClick}
      className={cn("gap-1.5 text-muted-foreground", className)}
      {...props}
    >
      {children ?? (
        <>
          Dismiss
          <Kbd>esc</Kbd>
        </>
      )}
    </Button>
  );
}

export type UserAskSubmitProps = ComponentProps<typeof Button>;

export function UserAskSubmit({ className, children, disabled, onClick, ...props }: UserAskSubmitProps) {
  const ask = useUserAskContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) ask.advance();
  }

  return (
    <Button
      data-control-ui="user-ask"
      data-slot="submit"
      type="button"
      variant="solid"
      tone="primary"
      size="xs"
      disabled={disabled ?? !ask.canContinue}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children ?? (
        <>
          Continue
          <Kbd className="bg-primary-foreground/15 text-primary-foreground ring-primary-foreground/25">⏎</Kbd>
        </>
      )}
    </Button>
  );
}
