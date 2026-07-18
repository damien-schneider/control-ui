import type { ReactNode } from "react";

import { ChatScene, ChatThought, ChatThread, ChatTurn } from "@/components/control-ui/chat-scene";

export function Example({ children }: { children: ReactNode }) {
  return (
    <ChatScene>
      <ChatThread>
        <ChatTurn from="assistant">
          <ChatThought />
          {children}
        </ChatTurn>
      </ChatThread>
    </ChatScene>
  );
}
