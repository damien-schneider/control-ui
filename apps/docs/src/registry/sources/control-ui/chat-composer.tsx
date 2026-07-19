"use client";

import type { ChangeEvent, ComponentProps } from "react";
import { createContext, useContext } from "react";

import type { ChatComposerProps } from "@/components/control-ui/contracts";
import { useChatComposer } from "@/components/control-ui/hooks/use-chat-composer";
import { cn } from "@/components/control-ui/lib/cn";
import { hasSkinAdornment, skinAdornment, skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";

type ChatComposerContextValue = ReturnType<typeof useChatComposer>;

const ChatComposerContext = createContext<ChatComposerContextValue | null>(null);

// Exported so opt-in editor extras (chat-composer-editor.tsx) share this context w/o pulling ProseMirror deps into base file.
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
  const input = useChatComposer({
    value,
    defaultValue,
    onValueChange,
    onSubmit,
    state,
    density,
    disabled,
    trackSends: hasSkinAdornment("chat-composer", "send-layer"),
  });
  const sendLayer = skinAdornment("chat-composer", "send-layer", { sendCount: input.sendCount });

  return (
    <ChatComposerContext.Provider value={input}>
      <form
        data-control-ui="chat-composer"
        data-slot="root"
        data-state={state}
        data-density={density}
        onSubmit={input.handleSubmit}
        className={cn(
          // sticky already makes the form the containing block + stacking context the send-layer anchor relies on
          "sticky bottom-0 w-full bg-background/80 px-2 pb-2 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/70",
          skinSlot("chat-composer", "root", {}),
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
    </ChatComposerContext.Provider>
  );
}

export type ChatComposerShellProps = ComponentProps<"div">;

export function ChatComposerShell({ className, ...props }: ChatComposerShellProps) {
  const input = useChatComposerContext();

  return (
    <div
      data-control-ui="chat-composer"
      data-slot="shell"
      data-state={input.state}
      className={cn(
        "relative overflow-hidden rounded-field border bg-card/78 shadow-sm ring-1 ring-foreground/4 transition-[box-shadow,filter,translate] duration-[var(--duration-base)] ease-[var(--ease-emphasized)]",
        "data-[state=submitting]:-translate-y-0.5 data-[state=submitting]:saturate-[1.02] data-[state=submitting]:shadow-md",
        skinSlot("chat-composer", "shell", {}),
        className,
      )}
      {...props}
    />
  );
}

export type ChatComposerAccentProps = ComponentProps<"div">;

export function ChatComposerAccent({ className, ...props }: ChatComposerAccentProps) {
  return (
    <div
      data-control-ui="chat-composer"
      data-slot="accent"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-foreground/20 to-transparent",
        skinSlot("chat-composer", "accent", {}),
        className,
      )}
      {...props}
    />
  );
}

export type ChatComposerTextareaProps = ComponentProps<"textarea">;

export function ChatComposerTextarea({ className, rows, disabled, onChange, ...props }: ChatComposerTextareaProps) {
  const input = useChatComposerContext();

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(event);
    if (!event.defaultPrevented) input.setValue(event.currentTarget.value);
  }

  return (
    <textarea
      {...props}
      data-control-ui="chat-composer"
      data-slot="textarea"
      aria-label="Message"
      value={input.value}
      onChange={handleChange}
      disabled={disabled ?? input.isDisabled}
      rows={rows ?? input.rows}
      className={cn(
        // CSS-first auto-grow via field-sizing-content (bounded min/max-h, no ref/ResizeObserver/scrollHeight); rows = fallback where unsupported.
        "field-sizing-content min-h-16 max-h-[40dvh] w-full resize-none bg-transparent px-[var(--padding-x)] py-[var(--padding-y)] text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
        skinSlot("chat-composer", "textarea", {}),
        className,
      )}
    />
  );
}

export type ChatComposerToolbarProps = ComponentProps<"div">;

export function ChatComposerToolbar({ className, ...props }: ChatComposerToolbarProps) {
  return (
    <div
      data-control-ui="chat-composer"
      data-slot="toolbar"
      className={cn("flex min-h-10 items-center justify-between gap-2 px-2.5 pb-2", skinSlot("chat-composer", "toolbar", {}), className)}
      {...props}
    />
  );
}

export type ChatComposerToolsProps = ComponentProps<"div">;

export function ChatComposerTools({ className, ...props }: ChatComposerToolsProps) {
  return (
    <div
      data-control-ui="chat-composer"
      data-slot="tools"
      className={cn("flex min-w-0 items-center gap-1.5 text-muted-foreground", skinSlot("chat-composer", "tools", {}), className)}
      {...props}
    />
  );
}

export type ChatComposerFooterProps = ComponentProps<"div">;

export function ChatComposerFooter({ className, ...props }: ChatComposerFooterProps) {
  return (
    <div
      data-control-ui="chat-composer"
      data-slot="footer"
      className={cn("px-3 pb-2 text-meta text-muted-foreground", skinSlot("chat-composer", "footer", {}), className)}
      {...props}
    />
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
      disabled={disabled ?? !input.canSubmit}
      className={cn(skinSlot("chat-composer", "submit", {}), className)}
      {...props}
    >
      {children}
    </Button>
  );
}
