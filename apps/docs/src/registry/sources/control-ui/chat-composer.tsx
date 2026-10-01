"use client";

import { Square } from "lucide-react";
import type { ChangeEvent, ComponentProps, CSSProperties, KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";
import { createContext, useContext, useEffect, useRef } from "react";
import type { ChatComposerController, ChatComposerProps } from "@/components/control-ui/hooks/use-chat-composer";
import { useChatComposer } from "@/components/control-ui/hooks/use-chat-composer";
import type { ChatComposerKnobStyle } from "@/components/control-ui/knob-contracts/chat-composer-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { hasSkinAdornment, skinAdornment } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";
import { Spinner } from "@/components/control-ui/ui/spinner";

type ChatComposerContextValue = ChatComposerController;

const ChatComposerContext = createContext<ChatComposerContextValue | null>(null);

export function useChatComposerContext() {
  const context = useContext(ChatComposerContext);

  if (!context) throw new Error("ChatComposer compound components must be rendered inside <ChatComposer>.");
  return context;
}

export function ChatComposer({
  value,
  defaultValue,
  onValueChange,
  onSubmit,
  state = "idle",
  density = "comfortable",
  disabled = false,
  allowEmptySubmit = false,
  submitKey = "enter",
  className,
  children,
  ...props
}: ChatComposerProps) {
  const skin = useSkin();
  const input = useChatComposer({
    value,
    defaultValue,
    onValueChange,
    onSubmit,
    state,
    density,
    disabled,
    allowEmptySubmit,
    submitKey,
    trackSends: hasSkinAdornment(skin, "chat-composer", "send-layer"),
  });
  const sendLayer = skinAdornment(skin, "chat-composer", "send-layer", { sendCount: input.sendCount });

  return (
    <ChatComposerContext.Provider value={input}>
      <form
        data-control-ui="chat-composer"
        data-control-family="chat-composer"
        data-slot="root"
        data-state={state}
        data-density={density}
        onSubmit={input.handleSubmit}
        className={cn("relative min-w-0 w-full", className)}
        {...props}
      >
        {sendLayer !== undefined && sendLayer !== null ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip contain-paint">
            {sendLayer}
          </div>
        ) : null}
        {children}
      </form>
    </ChatComposerContext.Provider>
  );
}

export type ChatComposerShellProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ChatComposerKnobStyle };

export function ChatComposerShell({ className, ...props }: ChatComposerShellProps) {
  const input = useChatComposerContext();

  return (
    <div
      data-control-ui="chat-composer"
      data-control-family="chat-composer"
      data-slot="shell"
      data-state={input.state}
      data-surface="panel"
      className={cn("relative overflow-hidden", className)}
      {...props}
    />
  );
}

export type ChatComposerAccentProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ChatComposerKnobStyle };

export function ChatComposerAccent({ className, ...props }: ChatComposerAccentProps) {
  return (
    <div
      data-control-ui="chat-composer"
      data-control-family="chat-composer"
      data-slot="accent"
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-x-5 top-0", className)}
      {...props}
    />
  );
}

export type ChatComposerTextareaProps = Omit<ComponentProps<"textarea">, "style"> & {
  style?: CSSProperties & ChatComposerKnobStyle;
};

export function ChatComposerTextarea({
  className,
  rows,
  disabled,
  readOnly,
  onChange,
  onKeyDown,
  ref,
  ...props
}: ChatComposerTextareaProps) {
  const input = useChatComposerContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { registerInsertionTarget } = input;

  useEffect(
    () =>
      registerInsertionTarget((text) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, "end");
        // setRangeText skips React's value tracker, so a bubbling input event reaches onChange like typed text does.
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }),
    [registerInsertionTarget],
  );

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(event);
    if (!event.defaultPrevented) input.setValue(event.currentTarget.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);
    input.handleKeyDown(event);
  }

  function attachTextarea(node: HTMLTextAreaElement | null) {
    textareaRef.current = node;
    assignRef(ref, node);
  }

  return (
    <textarea
      ref={attachTextarea}
      data-control-ui="chat-composer"
      data-control-family="chat-composer"
      data-slot="textarea"
      aria-label="Message"
      {...props}
      value={input.value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled || input.isDisabled}
      readOnly={readOnly || input.isLocked}
      aria-busy={input.isLocked || undefined}
      rows={rows ?? input.rows}
      className={cn(
        "field-sizing-content min-h-16 max-h-[40dvh] w-full resize-none px-[var(--padding-x)] py-[var(--padding-y)] disabled:cursor-not-allowed",
        className,
      )}
    />
  );
}

export type ChatComposerToolbarProps = ComponentProps<"div"> & { style?: CSSProperties & ChatComposerKnobStyle };

export function ChatComposerToolbar({ className, ...props }: ChatComposerToolbarProps) {
  return (
    <div
      data-control-ui="chat-composer"
      data-control-family="chat-composer"
      data-slot="toolbar"
      className={cn("flex items-center justify-between", className)}
      {...props}
    />
  );
}

export type ChatComposerToolsProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ChatComposerKnobStyle };

export function ChatComposerTools({ className, ...props }: ChatComposerToolsProps) {
  return (
    <div
      data-control-ui="chat-composer"
      data-control-family="chat-composer"
      data-slot="tools"
      className={cn("flex min-w-0 flex-wrap items-center", className)}
      {...props}
    />
  );
}

export type ChatComposerFooterProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ChatComposerKnobStyle };

export function ChatComposerFooter({ className, ...props }: ChatComposerFooterProps) {
  return <div data-control-ui="chat-composer" data-control-family="chat-composer" data-slot="footer" className={className} {...props} />;
}

export type ChatComposerSubmitProps = ComponentProps<typeof Button> & {
  /** While the composer is submitting, turns this same button into Stop so focus stays put. */
  onStop?: () => void;
  stopLabel?: string;
  /** Content of an `iconOnly` button in its Stop state; `stopLabel` becomes its name. */
  stopIcon?: ReactNode;
};

export function ChatComposerSubmit({
  className,
  disabled,
  iconOnly = false,
  children = "Send",
  onStop,
  stopLabel = "Stop response",
  stopIcon = <Square aria-hidden="true" className="fill-current" />,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: ChatComposerSubmitProps) {
  const input = useChatComposerContext();
  const isStop = input.isLocked && onStop !== undefined;
  const isBusy = input.isLocked && !isStop;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (isStop && !event.defaultPrevented) onStop();
  }

  function content() {
    if (isStop) return iconOnly ? stopIcon : stopLabel;
    if (!isBusy) return children;
    if (iconOnly) return <Spinner aria-hidden="true" />;
    return (
      <>
        <Spinner aria-hidden="true" />
        {children}
      </>
    );
  }

  return (
    <Button
      data-control-ui="chat-composer"
      data-slot="submit"
      data-stop={isStop ? "true" : undefined}
      type={isStop ? "button" : "submit"}
      variant="solid"
      tone="primary"
      size="xs"
      iconOnly={iconOnly}
      disabled={isStop ? disabled : disabled || !input.canSubmit}
      aria-busy={isBusy || undefined}
      aria-label={isStop && iconOnly ? stopLabel : ariaLabel}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {content()}
    </Button>
  );
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}
