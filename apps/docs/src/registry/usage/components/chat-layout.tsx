import type { ReactNode } from "react";

import { ChatLayout, ChatThread, ChatTurn } from "@/components/control-ui/chat-layout";

export function Example({ children }: { children: ReactNode }) {
  return (
    <ChatLayout>
      <ChatThread>
        <ChatTurn from="assistant">{children}</ChatTurn>
      </ChatThread>
    </ChatLayout>
  );
}
