"use client";

import { Square } from "lucide-react";
import type {
  ChangeEvent,
  ComponentProps,
  CSSProperties,
  Dispatch,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  Ref,
  RefObject,
  SetStateAction,
} from "react";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChatComposerController, ChatComposerProps } from "@/components/control-ui/hooks/use-chat-composer";
import { useChatComposer } from "@/components/control-ui/hooks/use-chat-composer";
import type { ChatComposerKnobStyle } from "@/components/control-ui/knob-contracts/chat-composer-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { attachComposerEngagement, claimComposerPress } from "@/components/control-ui/lib/composer-engagement";
import { focusTextControlOnPress } from "@/components/control-ui/lib/press-focus";
import { hasSkinAdornment, skinAdornment } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";
import { Spinner } from "@/components/control-ui/ui/spinner";

type ChatComposerContextValue = ChatComposerController;

const ChatComposerContext = createContext<ChatComposerContextValue | null>(null);
const ChatComposerHoldContext = createContext<Dispatch<SetStateAction<number>> | null>(null);

export function useHoldChatComposerOpen(held: boolean) {
  const setHolds = useContext(ChatComposerHoldContext);

  useLayoutEffect(() => {
    if (!(setHolds && held)) return;
    setHolds((holds) => holds + 1);
    return () => setHolds((holds) => holds - 1);
  }, [setHolds, held]);
}

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
  layout = "auto",
  className,
  children,
  ref,
  onPointerDown,
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
  const rootRef = useRef<HTMLFormElement>(null);
  const [holds, setHolds] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (layout === "auto" && root) return attachComposerEngagement(root);
  }, [layout]);

  function attachRoot(node: HTMLFormElement | null) {
    rootRef.current = node;
    assignRef(ref, node);
  }

  function handlePointerDown(event: PointerEvent<HTMLFormElement>) {
    onPointerDown?.(event);
    claimComposerPress(event);
  }

  return (
    <ChatComposerContext.Provider value={input}>
      <ChatComposerHoldContext.Provider value={setHolds}>
        <form
          ref={attachRoot}
          data-control-ui="chat-composer"
          data-control-family="chat-composer"
          data-slot="root"
          data-state={state}
          data-density={density}
          data-layout={layout}
          data-draft={input.value.length > 0 || holds > 0 ? "" : undefined}
          onSubmit={input.handleSubmit}
          onPointerDown={handlePointerDown}
          className={cn("relative min-w-0 w-full", className)}
          {...props}
        >
          {sendLayer !== undefined && sendLayer !== null ? (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-1 overflow-clip contain-paint">
              {sendLayer}
            </div>
          ) : null}
          {children}
        </form>
      </ChatComposerHoldContext.Provider>
    </ChatComposerContext.Provider>
  );
}

export type ChatComposerShellProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ChatComposerKnobStyle };

const ChatComposerMessageContext = createContext<RefObject<HTMLElement | null> | null>(null);

// The textarea or rich editor registers itself here, so the shell can focus it from its padding and toolbar.
export function useChatComposerMessageRef() {
  return useContext(ChatComposerMessageContext);
}

export function ChatComposerShell({ className, onMouseDown, ...props }: ChatComposerShellProps) {
  const input = useChatComposerContext();
  const messageRef = useRef<HTMLElement | null>(null);

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    onMouseDown?.(event);
    focusTextControlOnPress(event, messageRef.current);
  }

  return (
    <ChatComposerMessageContext.Provider value={messageRef}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a pointer shortcut to the message, which keyboard users reach with Tab. */}
      <div
        data-control-ui="chat-composer"
        data-control-family="chat-composer"
        data-slot="shell"
        data-state={input.state}
        data-surface="panel"
        className={cn("relative overflow-hidden", className)}
        onMouseDown={handleMouseDown}
        {...props}
      />
    </ChatComposerMessageContext.Provider>
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

export type ChatComposerHeaderProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ChatComposerKnobStyle };

export function ChatComposerHeader({ className, ...props }: ChatComposerHeaderProps) {
  return <div data-control-ui="chat-composer" data-control-family="chat-composer" data-slot="header" className={className} {...props} />;
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
  const messageRef = useChatComposerMessageRef();
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
    if (messageRef) messageRef.current = node;
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
      className={className}
    />
  );
}

export type ChatComposerToolbarProps = ComponentProps<"div"> & { style?: CSSProperties & ChatComposerKnobStyle };

export function ChatComposerToolbar({ className, ...props }: ChatComposerToolbarProps) {
  return <div data-control-ui="chat-composer" data-control-family="chat-composer" data-slot="toolbar" className={className} {...props} />;
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
  const stopName = iconOnly ? stopLabel : undefined;

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
      focusableWhenDisabled={isBusy}
      aria-busy={isBusy || undefined}
      aria-label={isStop ? stopName : ariaLabel}
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
