import type { ComponentProps, ElementType, ReactNode } from "react";
import { Activity, ActivityContent, ActivityTitle, ActivityTrigger } from "@/components/control-ui/activity";
import { cn } from "@/components/control-ui/lib/cn";
import { skinAdornment, skinSlot } from "@/components/control-ui/skin";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

type ChatThoughtCollapsible = {
  Root: ElementType;
  Trigger: ElementType;
  Content: ElementType;
};

export type ChatSceneProps = ComponentProps<"section">;

export function ChatScene({ children, className, ...props }: ChatSceneProps) {
  return (
    <section
      data-control-ui="chat-scene"
      data-slot="root"
      data-surface="panel"
      className={cn(
        // Elevation "raised": shadow-md, one tier above sidebar's shadow-sm; border carries definition when --shadow-size flattens to 0 (flat DA).
        "relative mx-auto flex min-h-[640px] w-full max-w-3xl flex-col overflow-hidden rounded-scene border bg-background shadow-md",
        skinSlot("chat-scene", "root", {}),
        className,
      )}
      {...props}
    >
      {skinAdornment("chat-scene", "titlebar", {})}
      {children}
    </section>
  );
}

export type ChatThreadProps = ComponentProps<"div">;

export function ChatThread({ children, className, ...props }: ChatThreadProps) {
  return (
    <div
      data-control-ui="chat-thread"
      data-slot="root"
      className={cn("flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-8", skinSlot("chat-thread", "root", {}), className)}
      {...props}
    >
      {children}
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
      data-slot="root"
      data-from={from}
      className={cn("group/turn flex w-full flex-col", from === "user" && "items-end", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export type ChatThoughtProps = ComponentProps<"div"> & {
  details?: ReactNode;
  defaultOpen?: boolean;
  collapsible?: ChatThoughtCollapsible;
};

export function ChatThought({
  children = "Thought for a couple of seconds",
  details = "Read the attachment, grouped the notes by intent, and kept the final markdown compact enough to scan.",
  defaultOpen = false,
  collapsible,
  className,
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
        data-slot="root"
        className={cn("mb-2 self-start", skinSlot("chat-thought", "root", {}), className)}
        {...props}
      >
        <Trigger
          type="button"
          data-control-ui="chat-thought"
          data-slot="trigger"
          className="inline-flex items-center gap-1 rounded-[var(--radius-control)] px-1.5 py-1 text-meta font-medium text-muted-foreground transition hover:bg-foreground/4 hover:text-foreground [&[data-state=open]>span:last-child]:rotate-90"
        >
          {children}
          <span
            aria-hidden="true"
            className="text-sm leading-none transition-transform duration-[var(--duration-base)] ease-[var(--ease-emphasized)]"
          >
            ›
          </span>
        </Trigger>
        <Content>
          <ScrollArea
            maxHeight="var(--activity-content-max-height, min(24rem, 50dvh))"
            lockAxis="x"
            viewportProps={{ "data-control-ui": "activity", "data-slot": "content-viewport" }}
          >
            <div
              data-control-ui="chat-thought"
              data-slot="details"
              className={cn("min-w-0 px-1 pb-2 pt-1 text-meta leading-5 text-muted-foreground", skinSlot("chat-thought", "details", {}))}
            >
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
      data-slot="root"
      className={cn("my-0 mb-2 self-start", skinSlot("chat-thought", "root", {}), className)}
      {...props}
    >
      <ActivityTrigger data-control-ui="chat-thought" data-slot="trigger" className="min-h-0 w-fit gap-1 px-1.5 py-1 text-meta font-medium">
        <ActivityTitle className="text-meta font-medium">{children}</ActivityTitle>
      </ActivityTrigger>
      <ActivityContent
        data-control-ui="chat-thought"
        data-slot="details"
        className={cn("text-meta leading-5 text-muted-foreground", skinSlot("chat-thought", "details", {}))}
      >
        {skinAdornment("chat-thought", "details", {})}
        {details}
      </ActivityContent>
    </Activity>
  );
}
