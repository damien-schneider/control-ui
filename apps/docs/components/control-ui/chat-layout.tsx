import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { ChatLayoutKnobStyle } from "@/components/control-ui/knob-contracts/chat-layout-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { SkinAdornment } from "@/components/control-ui/skin-provider";

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
      {chrome === "panel" ? <SkinAdornment scope="chat-layout" part="titlebar" context={{}} /> : null}
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
