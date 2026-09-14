"use client";

import type { ChangeEvent, ComponentProps, CSSProperties, KeyboardEvent } from "react";
import { createContext, useContext } from "react";
import type { ChatComposerProps } from "@/components/control-ui/hooks/use-chat-composer";
import { useChatComposer } from "@/components/control-ui/hooks/use-chat-composer";
import { useKeyboardNavigation } from "@/components/control-ui/hooks/use-keyboard-navigation";
import type { ChatComposerKnobStyle } from "@/components/control-ui/knob-contracts/chat-composer-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { hasSkinAdornment, skinAdornment } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";

type ChatComposerContextValue = ReturnType<typeof useChatComposer>;

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
  const keyboardNavigation = useKeyboardNavigation();

  return (
    <div
      data-keyboard-navigation={keyboardNavigation ? "" : undefined}
      data-control-ui="chat-composer"
      data-control-family="chat-composer"
      data-slot="shell"
      data-state={input.state}
      data-surface="floating"
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

export function ChatComposerTextarea({ className, rows, disabled, onChange, onKeyDown, ...props }: ChatComposerTextareaProps) {
  const input = useChatComposerContext();

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(event);
    if (!event.defaultPrevented) input.setValue(event.currentTarget.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);
    input.handleKeyDown(event);
  }

  return (
    <textarea
      data-control-ui="chat-composer"
      data-control-family="chat-composer"
      data-slot="textarea"
      aria-label="Message"
      {...props}
      value={input.value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled || input.isDisabled}
      rows={rows ?? input.rows}
      className={cn(
        "field-sizing-content min-h-16 max-h-[40dvh] w-full resize-none outline-none px-[var(--padding-x)] py-[var(--padding-y)] disabled:cursor-not-allowed",
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
  return (
    <div data-control-ui="chat-composer" data-control-family="chat-composer" data-slot="footer" className={cn(className)} {...props} />
  );
}

export type ChatComposerSubmitProps = ComponentProps<typeof Button>;

export function ChatComposerSubmit({ className, disabled, children = "Send", ...props }: ChatComposerSubmitProps) {
  const input = useChatComposerContext();

  return (
    <Button
      data-control-ui="chat-composer"
      data-slot="submit"
      type="submit"
      variant="solid"
      tone="primary"
      size="xs"
      disabled={disabled || !input.canSubmit}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
