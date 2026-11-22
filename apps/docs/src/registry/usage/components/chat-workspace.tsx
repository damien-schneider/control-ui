import type { ReactNode } from "react";

import { ChatLayout, ChatLayoutActions, ChatLayoutHeader, ChatLayoutTitle, ChatThread } from "@/components/control-ui/chat-layout";
import {
  ChatWorkspace,
  ChatWorkspaceCollapsible,
  ChatWorkspaceDockToggle,
  ChatWorkspaceExpandToggle,
  ChatWorkspaceInset,
  ChatWorkspaceMain,
  ChatWorkspacePanel,
  ChatWorkspaceResizeHandle,
} from "@/components/control-ui/chat-workspace";

export function Example({ page, messages, composer }: { page: ReactNode; messages: ReactNode; composer: ReactNode }) {
  return (
    <ChatWorkspace className="h-dvh">
      <ChatWorkspaceMain>
        {page}
        <ChatWorkspaceInset />
      </ChatWorkspaceMain>
      <ChatWorkspacePanel>
        <ChatLayout chrome="embedded">
          <ChatLayoutHeader>
            <ChatWorkspaceExpandToggle />
            <ChatLayoutTitle>Chat</ChatLayoutTitle>
            <ChatLayoutActions>
              <ChatWorkspaceDockToggle />
            </ChatLayoutActions>
          </ChatLayoutHeader>
          <ChatWorkspaceCollapsible>
            <ChatThread>{messages}</ChatThread>
          </ChatWorkspaceCollapsible>
          {composer}
        </ChatLayout>
        <ChatWorkspaceResizeHandle />
      </ChatWorkspacePanel>
    </ChatWorkspace>
  );
}
