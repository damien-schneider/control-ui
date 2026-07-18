import type { ComponentProps, ReactNode } from "react";

import { ChatScene, ChatThread } from "@/components/control-ui/chat-scene";

export type ChatBlockProps = Omit<ComponentProps<typeof ChatScene>, "children"> & {
  children: ReactNode;
  composer: ReactNode;
};

export function ChatBlock({ children, composer, className, ...props }: ChatBlockProps) {
  return (
    <ChatScene className={className} {...props}>
      <ChatThread>{children}</ChatThread>
      {composer}
    </ChatScene>
  );
}
