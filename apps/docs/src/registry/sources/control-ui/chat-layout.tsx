import type { ComponentProps, CSSProperties, ElementType, ReactNode } from "react";
import { Activity, ActivityContent, ActivityTitle, ActivityTrigger } from "@/components/control-ui/activity";
import type { ChatLayoutKnobStyle } from "@/components/control-ui/knob-contracts/chat-layout-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinAdornment } from "@/components/control-ui/skin";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

type ChatThoughtCollapsible = {
  Root: ElementType;
  Trigger: ElementType;
  Content: ElementType;
};

export type ChatLayoutChrome = "panel" | "embedded";

export type ChatLayoutProps = Omit<ComponentProps<"section">, "style"> & {
  chrome?: ChatLayoutChrome;
  style?: CSSProperties & ChatLayoutKnobStyle;
};

export function ChatLayout({ children, chrome = "panel", className, ...props }: ChatLayoutProps) {
  return (
    <section
      data-control-ui="chat-layout"
      data-control-family="chat-layout"
      data-slot="root"
      data-chrome={chrome}
      data-surface={chrome === "panel" ? "panel" : undefined}
      className={cn("relative mx-auto flex min-h-[640px] w-full max-w-3xl flex-col overflow-hidden", className)}
      {...props}
    >
      {chrome === "panel" ? skinAdornment("chat-layout", "titlebar", {}) : null}
      {children}
    </section>
  );
}

export type ChatThreadProps = ComponentProps<"div"> & {
  composer?: ReactNode;
};

export function ChatThread({ children, composer, className, ...props }: ChatThreadProps) {
  return (
    <div
      data-control-ui="chat-thread"
      data-control-family="chat-layout"
      data-chat-layout-kind="thread"
      data-slot="root"
      className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto", className)}
      {...props}
    >
      <div className="relative flex min-h-full min-w-0 flex-col">
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

export type ChatThoughtProps = Omit<ComponentProps<"div">, "style"> & {
  details?: ReactNode;
  defaultOpen?: boolean;
  collapsible?: ChatThoughtCollapsible;
  style?: CSSProperties & ChatLayoutKnobStyle;
};

export function ChatThought({
  children = "Thought for a couple of seconds",
  details = "Read the attachment, grouped the notes by intent, and kept the final markdown compact enough to scan.",
  defaultOpen = false,
  collapsible,
  className,
  style,
  ...props
}: ChatThoughtProps) {
  if (collapsible) {
    const Root = collapsible.Root;
    const Trigger = collapsible.Trigger;
    const Content = collapsible.Content;

    return (
      <Root
        defaultOpen={defaultOpen}
        data-control-ui="chat-thought"
        data-control-family="chat-layout"
        data-chat-layout-kind="thought"
        data-slot="root"
        className={cn("self-start", className)}
        style={style}
        {...props}
      >
        <Trigger
          type="button"
          data-control-ui="chat-thought"
          data-control-family="chat-layout"
          data-slot="trigger"
          className="inline-flex items-center"
        >
          {children}
          <span aria-hidden="true" data-control-ui="chat-thought" data-control-family="chat-layout" data-slot="chevron">
            ›
          </span>
        </Trigger>
        <Content>
          <ScrollArea
            maxHeight="min(24rem, 50dvh)"
            lockAxis="x"
            viewportProps={{
              "data-control-ui": "activity",
              "data-control-family": "activity",
              "data-slot": "content-viewport",
            }}
          >
            <div data-control-ui="chat-thought" data-control-family="chat-layout" data-slot="details" className="min-w-0 px-1 pb-2 pt-1">
              {skinAdornment("chat-thought", "details", {})}
              {details}
            </div>
          </ScrollArea>
        </Content>
      </Root>
    );
  }

  return (
    <Activity
      state="success"
      defaultOpen={defaultOpen}
      data-control-ui="chat-thought"
      data-control-family="chat-layout"
      data-chat-layout-kind="thought"
      data-slot="root"
      className={cn("self-start", className)}
      style={style}
      {...props}
    >
      <ActivityTrigger data-control-ui="chat-thought" data-control-family="chat-layout" data-slot="trigger">
        <ActivityTitle data-control-ui="chat-thought" data-control-family="chat-layout" data-slot="title">
          {children}
        </ActivityTitle>
      </ActivityTrigger>
      <ActivityContent data-control-ui="chat-thought" data-control-family="chat-layout" data-slot="details">
        {skinAdornment("chat-thought", "details", {})}
        {details}
      </ActivityContent>
    </Activity>
  );
}
