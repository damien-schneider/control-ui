"use client";

import type { ChangeEvent, ComponentProps } from "react";
import { createContext, useContext } from "react";

import type { ChatInputProps } from "@/components/control-ui/contracts";
import { useChatInput } from "@/components/control-ui/hooks/use-chat-input";
import { cn } from "@/components/control-ui/lib/cn";
import { hasSkinAdornment, skinAdornment, skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";

type ChatInputContextValue = ReturnType<typeof useChatInput>;

const ChatInputContext = createContext<ChatInputContextValue | null>(null);

// Exported so opt-in editor extras (chat-input-editor.tsx) share this context w/o pulling ProseMirror deps into base file.
export function useChatInputContext() {
  const context = useContext(ChatInputContext);
  if (!context) throw new Error("ChatInput compound components must be rendered inside <ChatInput>.");
  return context;
}

export function ChatInput({
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
}: ChatInputProps) {
  const input = useChatInput({
    value,
    defaultValue,
    onValueChange,
    onSubmit,
    state,
    density,
    disabled,
    trackSends: hasSkinAdornment("chat-input", "send-layer"),
  });
  const sendLayer = skinAdornment("chat-input", "send-layer", { sendCount: input.sendCount });

  return (
    <ChatInputContext.Provider value={input}>
      <form
        data-control-ui="chat-input"
        data-slot="root"
        data-state={state}
        data-density={density}
        onSubmit={input.handleSubmit}
        className={cn(
          // sticky already makes the form the containing block + stacking context the send-layer anchor relies on
          "sticky bottom-0 w-full bg-background/80 px-2 pb-2 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/70",
          skinSlot("chat-input", "root", {}),
          className,
        )}
        {...props}
      >
        {/* send-layer anchor: the component owns this position contract (backdrop behind the shell, hit-test/a11y/paint
            contained); the skin only supplies visuals. Zero DOM when no skin fills the anchor. */}
        {sendLayer !== undefined && sendLayer !== null ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip contain-paint">
            {sendLayer}
          </div>
        ) : null}
        {children}
      </form>
    </ChatInputContext.Provider>
  );
}

export type ChatInputShellProps = ComponentProps<"div">;

export function ChatInputShell({ className, ...props }: ChatInputShellProps) {
  const input = useChatInputContext();

  return (
    <div
      data-control-ui="chat-input"
      data-slot="shell"
      data-state={input.state}
      className={cn(
        "relative overflow-hidden rounded-field border bg-card/78 shadow-sm ring-1 ring-foreground/4 transition-[box-shadow,filter,translate] duration-[var(--duration-base)] ease-[var(--ease-emphasized)]",
        "data-[state=submitting]:-translate-y-0.5 data-[state=submitting]:saturate-[1.02] data-[state=submitting]:shadow-md",
        skinSlot("chat-input", "shell", {}),
        className,
      )}
      {...props}
    />
  );
}

export type ChatInputAccentProps = ComponentProps<"div">;

export function ChatInputAccent({ className, ...props }: ChatInputAccentProps) {
  return (
    <div
      data-control-ui="chat-input"
      data-slot="accent"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-foreground/20 to-transparent",
        skinSlot("chat-input", "accent", {}),
        className,
      )}
      {...props}
    />
  );
}

export type ChatInputTextareaProps = ComponentProps<"textarea">;

export function ChatInputTextarea({ className, rows, disabled, onChange, ...props }: ChatInputTextareaProps) {
  const input = useChatInputContext();

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(event);
    if (!event.defaultPrevented) input.setValue(event.currentTarget.value);
  }

  return (
    <textarea
      {...props}
      data-control-ui="chat-input"
      data-slot="textarea"
      aria-label="Message"
      value={input.value}
      onChange={handleChange}
      disabled={disabled ?? input.isDisabled}
      rows={rows ?? input.rows}
      className={cn(
        // CSS-first auto-grow via field-sizing-content (bounded min/max-h, no ref/ResizeObserver/scrollHeight); rows = fallback where unsupported.
        "field-sizing-content min-h-16 max-h-[40dvh] w-full resize-none bg-transparent px-[var(--padding-x)] py-[var(--padding-y)] text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
        skinSlot("chat-input", "textarea", {}),
        className,
      )}
    />
  );
}

export type ChatInputToolbarProps = ComponentProps<"div">;

export function ChatInputToolbar({ className, ...props }: ChatInputToolbarProps) {
  return (
    <div
      data-control-ui="chat-input"
      data-slot="toolbar"
      className={cn("flex min-h-10 items-center justify-between gap-2 px-2.5 pb-2", skinSlot("chat-input", "toolbar", {}), className)}
      {...props}
    />
  );
}

export type ChatInputToolsProps = ComponentProps<"div">;

export function ChatInputTools({ className, ...props }: ChatInputToolsProps) {
  return (
    <div
      data-control-ui="chat-input"
      data-slot="tools"
      className={cn("flex min-w-0 items-center gap-1.5 text-muted-foreground", skinSlot("chat-input", "tools", {}), className)}
      {...props}
    />
  );
}

export type ChatInputFooterProps = ComponentProps<"div">;

export function ChatInputFooter({ className, ...props }: ChatInputFooterProps) {
  return (
    <div
      data-control-ui="chat-input"
      data-slot="footer"
      className={cn("px-3 pb-2 text-meta text-muted-foreground", skinSlot("chat-input", "footer", {}), className)}
      {...props}
    />
  );
}

export type ChatInputSubmitProps = ComponentProps<typeof Button>;

export function ChatInputSubmit({ className, disabled, children = "Send", ...props }: ChatInputSubmitProps) {
  const input = useChatInputContext();

  return (
    <Button
      data-control-ui="chat-input"
      data-slot="submit"
      type="submit"
      variant="solid"
      tone="primary"
      size="xs"
      disabled={disabled ?? !input.canSubmit}
      className={cn(skinSlot("chat-input", "submit", {}), className)}
      {...props}
    >
      {children}
    </Button>
  );
}
