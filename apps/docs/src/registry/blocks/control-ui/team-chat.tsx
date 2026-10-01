"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { SidebarInset, SidebarProvider } from "@/components/control-ui/ui/sidebar";

export type TeamChatBlockProps = Omit<ComponentProps<typeof SidebarProvider>, "children"> & {
  sidebar: ReactNode;
  children: ReactNode;
  thread?: ReactNode;
  threadLabel?: string;
};

export function TeamChatBlock({ sidebar, children, thread, threadLabel = "Thread", className, ...props }: TeamChatBlockProps) {
  const threadIsOpen = thread !== undefined && thread !== null;

  return (
    <SidebarProvider className={cn("bg-background text-foreground", className)} {...props}>
      {sidebar}
      <SidebarInset className="@container/team-chat flex h-full min-h-0 min-w-0 flex-row">
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", threadIsOpen && "@max-3xl/team-chat:hidden")}>{children}</div>
        {threadIsOpen ? (
          <aside
            aria-label={threadLabel}
            className="flex min-h-0 w-full min-w-0 flex-col border-border @3xl/team-chat:w-[min(26rem,45%)] @3xl/team-chat:shrink-0 @3xl/team-chat:border-s"
          >
            {thread}
          </aside>
        ) : null}
      </SidebarInset>
    </SidebarProvider>
  );
}
