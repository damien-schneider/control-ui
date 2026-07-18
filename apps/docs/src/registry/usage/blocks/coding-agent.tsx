"use client";

import { useState } from "react";
import {
  CodingAgentBlock,
  CodingAgentConversation,
  CodingAgentEmptyState,
  type CodingAgentProject,
} from "@/components/control-ui/blocks/coding-agent";
import { ChatInput, ChatInputShell, ChatInputSubmit, ChatInputTextarea, ChatInputToolbar } from "@/components/control-ui/chat-input";

const projects: readonly CodingAgentProject[] = [
  {
    id: "web",
    name: "web",
    tasks: [
      { id: "homepage", title: "Update the homepage" },
      { id: "tests", title: "Fix browser tests" },
    ],
  },
];

export default function CodingAgentPage() {
  const [activeTaskId, setActiveTaskId] = useState<string>();

  return (
    <CodingAgentBlock
      projects={projects}
      activeTaskId={activeTaskId}
      activeTaskTitle={projects[0].tasks.find((task) => task.id === activeTaskId)?.title}
      onTaskSelect={(task) => setActiveTaskId(task.id)}
      onNewTask={() => setActiveTaskId(undefined)}
    >
      <CodingAgentConversation
        composer={
          <ChatInput onSubmit={({ clear }) => clear()}>
            <ChatInputShell>
              <ChatInputTextarea placeholder="Ask the coding agent..." />
              <ChatInputToolbar>
                <span />
                <ChatInputSubmit>Send</ChatInputSubmit>
              </ChatInputToolbar>
            </ChatInputShell>
          </ChatInput>
        }
      >
        <CodingAgentEmptyState title="What should we build?" />
      </CodingAgentConversation>
    </CodingAgentBlock>
  );
}
