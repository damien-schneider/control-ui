import type { ReactNode } from "react";

import { ChatLayout, ChatThought, ChatThread, ChatTurn } from "@/components/control-ui/chat-layout";

export function Example({ children }: { children: ReactNode }) {
  return (
    <ChatLayout>
      <ChatThread>
        <ChatTurn from="assistant">
          <ChatThought />
          {children}
        </ChatTurn>
      </ChatThread>
    </ChatLayout>
  );
}
