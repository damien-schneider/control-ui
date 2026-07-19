"use client";

import { useState } from "react";
import {
  CodingAgentBlock,
  CodingAgentConversation,
  CodingAgentEmptyState,
  type CodingAgentProject,
} from "@/components/control-ui/blocks/coding-agent";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from "@/components/control-ui/chat-composer";

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
          <ChatComposer onSubmit={({ clear }) => clear()}>
            <ChatComposerShell>
              <ChatComposerTextarea placeholder="Ask the coding agent..." />
              <ChatComposerToolbar>
                <span />
                <ChatComposerSubmit>Send</ChatComposerSubmit>
              </ChatComposerToolbar>
            </ChatComposerShell>
          </ChatComposer>
        }
      >
        <CodingAgentEmptyState title="What should we build?" />
      </CodingAgentConversation>
    </CodingAgentBlock>
  );
}
