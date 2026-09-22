"use client";

import { ArrowDown } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { createContext, useContext } from "react";
import { useChatThreadScroll } from "@/components/control-ui/hooks/use-chat-thread-scroll";
import type { ChatLayoutKnobStyle } from "@/components/control-ui/knob-contracts/chat-layout-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { SkinAdornment } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";

export type ChatLayoutChrome = "panel" | "embedded";

export type ChatLayoutProps = Omit<ComponentProps<"section">, "style"> & {
  chrome?: ChatLayoutChrome;
  style?: CSSProperties & ChatLayoutKnobStyle;
};

const chromeSizing: Record<ChatLayoutChrome, string> = {
  panel: "mx-auto min-h-[640px] max-w-3xl",
  embedded: "h-full min-h-0 flex-1",
};

export function ChatLayout({ children, chrome = "panel", className, ...props }: ChatLayoutProps) {
  return (
    <section
      data-control-ui="chat-layout"
      data-control-family="chat-layout"
      data-slot="root"
      data-chrome={chrome}
      data-surface={chrome === "panel" ? "panel" : undefined}
      className={cn("relative flex w-full flex-col overflow-hidden", chromeSizing[chrome], className)}
      {...props}
    >
      {chrome === "panel" ? <SkinAdornment scope="chat-layout" part="titlebar" context={{}} /> : null}
      {children}
    </section>
  );
}

type ChatThreadScrollContextValue = {
  atBottom: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
};

const ChatThreadScrollContext = createContext<ChatThreadScrollContextValue | null>(null);

export type ChatThreadProps = ComponentProps<"div"> & {
  composer?: ReactNode;
};

export function ChatThread({ children, composer, className, ...props }: ChatThreadProps) {
  const { viewportRef, contentRef, atBottom, scrollToBottom } = useChatThreadScroll();

  return (
    <ChatThreadScrollContext.Provider value={{ atBottom, scrollToBottom }}>
      <div
        ref={viewportRef}
        data-control-ui="chat-thread"
        data-control-family="chat-layout"
        data-chat-layout-kind="thread"
        data-slot="root"
        data-at-bottom={atBottom ? "" : undefined}
        className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto", className)}
        {...props}
      >
        <div ref={contentRef} className="relative flex min-h-full min-w-0 flex-col">
          <div
            data-control-ui="chat-thread"
            data-control-family="chat-layout"
            data-slot="thread-content"
            className="flex min-w-0 flex-1 flex-col"
          >
            {children}
          </div>
          {composer ? (
            <div data-control-ui="chat-thread" data-control-family="chat-layout" data-slot="dock" className="sticky bottom-0 z-10 shrink-0">
              {composer}
            </div>
          ) : null}
        </div>
      </div>
    </ChatThreadScrollContext.Provider>
  );
}

export type ChatThreadScrollButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  label?: string;
};

export function ChatThreadScrollButton({ label = "Scroll to latest", className, onClick, ...props }: ChatThreadScrollButtonProps) {
  const scroll = useContext(ChatThreadScrollContext);
  if (!scroll) throw new Error("<ChatThreadScrollButton> must be rendered inside <ChatThread>.");

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) scroll?.scrollToBottom();
  }

  return (
    <div
      data-control-ui="chat-thread"
      data-control-family="chat-layout"
      data-slot="scroll-anchor"
      data-hidden={scroll.atBottom ? "" : undefined}
    >
      <Button
        {...props}
        type="button"
        variant="surface"
        size="sm"
        iconOnly
        aria-label={label}
        onClick={handleClick}
        className={cn("rounded-full", className)}
      >
        <ArrowDown aria-hidden="true" />
      </Button>
    </div>
  );
}

export type ChatTurnProps = ComponentProps<"section"> & {
  from: "user" | "assistant";
};

export function ChatTurn({ from, children, className, ...props }: ChatTurnProps) {
  return (
    <section
      data-control-ui="chat-turn"
      data-control-family="chat-layout"
      data-slot="turn"
      data-from={from}
      className={cn("flex w-full flex-col", from === "user" && "items-end", className)}
      {...props}
    >
      {children}
    </section>
  );
}
