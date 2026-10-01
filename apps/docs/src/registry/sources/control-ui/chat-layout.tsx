"use client";

import { useRender } from "@base-ui/react/use-render";
import { ArrowDown } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import { ChatThreadAnnounceContext } from "@/components/control-ui/hooks/use-chat-message";
import { useChatThreadScroll } from "@/components/control-ui/hooks/use-chat-thread-scroll";
import type { ChatLayoutKnobStyle } from "@/components/control-ui/knob-contracts/chat-layout-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { SkinAdornment } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

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

export type ChatLayoutHeaderProps = Omit<ComponentProps<"header">, "style"> & { style?: CSSProperties & ChatLayoutKnobStyle };

export function ChatLayoutHeader({ className, ...props }: ChatLayoutHeaderProps) {
  return (
    <header
      data-control-ui="chat-layout"
      data-control-family="chat-layout"
      data-slot="header"
      className={cn("grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center", className)}
      {...props}
    />
  );
}

export type ChatLayoutTitleProps = Omit<ComponentProps<"div">, "style"> & {
  render?: RenderProp<ComponentProps<"div">>;
  style?: CSSProperties & ChatLayoutKnobStyle;
};

/** Renders a `div`; pass `render={(props) => <h2 {...props} />}` for the heading level the page needs. */
export function ChatLayoutTitle({ render, className, ...props }: ChatLayoutTitleProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      className: cn("col-start-2 min-w-0 truncate", className),
      "data-control-ui": "chat-layout",
      "data-control-family": "chat-layout",
      "data-slot": "title",
    },
  });
}

export type ChatLayoutDescriptionProps = Omit<ComponentProps<"p">, "style"> & { style?: CSSProperties & ChatLayoutKnobStyle };

export function ChatLayoutDescription({ className, ...props }: ChatLayoutDescriptionProps) {
  return (
    <p
      data-control-ui="chat-layout"
      data-control-family="chat-layout"
      data-slot="description"
      className={cn("col-start-2 truncate", className)}
      {...props}
    />
  );
}

export type ChatLayoutActionsProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ChatLayoutKnobStyle };

export function ChatLayoutActions({ className, ...props }: ChatLayoutActionsProps) {
  return (
    <div
      data-control-ui="chat-layout"
      data-control-family="chat-layout"
      data-slot="actions"
      className={cn("col-start-3 row-span-2 row-start-1 flex items-center", className)}
      {...props}
    />
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
  const [announcement, setAnnouncement] = useState("");
  const [announce] = useState(() => (message: string) => {
    // A trailing no-break space makes a repeated message a real text change, so it is read again.
    setAnnouncement((current) => (current === message ? `${message}\u00a0` : message));
  });

  return (
    <ChatThreadAnnounceContext.Provider value={announce}>
      <ChatThreadScrollContext.Provider value={{ atBottom, scrollToBottom }}>
        <div
          data-control-ui="chat-thread"
          data-control-family="chat-layout"
          data-chat-layout-kind="thread"
          data-slot="root"
          data-at-bottom={atBottom ? "" : undefined}
          className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}
          {...props}
        >
          <ScrollArea
            className="flex min-h-0 flex-1 flex-col"
            viewportClassName="min-h-0 flex-1"
            contentClassName="flex min-h-full flex-col"
            viewportRef={viewportRef}
            lockAxis="x"
            mask={false}
            blur={false}
          >
            <div ref={contentRef} className="relative flex min-w-0 flex-1 flex-col">
              <div
                data-control-ui="chat-thread"
                data-control-family="chat-layout"
                data-slot="thread-content"
                className="flex min-w-0 flex-1 flex-col"
              >
                {children}
              </div>
              {composer ? (
                <div
                  data-control-ui="chat-thread"
                  data-control-family="chat-layout"
                  data-slot="dock"
                  className="sticky bottom-0 z-10 shrink-0"
                >
                  {composer}
                </div>
              ) : null}
            </div>
          </ScrollArea>
          <LiveStatus message={announcement} />
        </div>
      </ChatThreadScrollContext.Provider>
    </ChatThreadAnnounceContext.Provider>
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
