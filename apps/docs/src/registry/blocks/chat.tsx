import type { ComponentProps, ReactNode } from "react";

import { ChatLayout, ChatThread } from "@/components/control-ui/chat-layout";

export type ChatBlockProps = Omit<ComponentProps<typeof ChatLayout>, "children"> & {
  children: ReactNode;
  composer: ReactNode;
};

export function ChatBlock({ children, composer, className, ...props }: ChatBlockProps) {
  return (
    <ChatLayout className={className} {...props}>
      <ChatThread>{children}</ChatThread>
      {composer}
    </ChatLayout>
  );
}
