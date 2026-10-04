"use client";

import { useState } from "react";
import {
  Activity,
  ActivityContent,
  ActivityDetail,
  ActivityDetailContent,
  ActivityDetailLabel,
  ActivityIcon,
  ActivityStatus,
  ActivityTitle,
  ActivityTrigger,
} from "@/components/control-ui/activity";
import {
  ChatMessage,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageEditable,
  ChatMessageHeader,
  ChatMessageRow,
} from "@/components/control-ui/chat-message";

export function ChatMessageExample() {
  const [prompt, setPrompt] = useState("Does this render the active setup?");
  return (
    <div>
      <ChatMessage from="user">
        <ChatMessageRow>
          <ChatMessageBody>
            <ChatMessageEditable value={prompt} onSave={setPrompt} />
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
      <ChatMessage from="assistant" state="streaming">
        <ChatMessageRow>
          <ChatMessageBody>
            <ChatMessageHeader>Assistant</ChatMessageHeader>
            <ChatMessageContent>
              <span>Provider-owned parts compose directly into the installed message anatomy.</span>
            </ChatMessageContent>
            <Activity kind="tool" name="active_setup" state="success">
              <ActivityTrigger>
                <ActivityIcon />
                <ActivityTitle>Active setup</ActivityTitle>
                <ActivityStatus className="sr-only" />
              </ActivityTrigger>
              <ActivityContent>
                <ActivityDetail>
                  <ActivityDetailLabel>Input</ActivityDetailLabel>
                  <ActivityDetailContent format="code">{`{ "surface": "control-ui" }`}</ActivityDetailContent>
                </ActivityDetail>
                <ActivityDetail>
                  <ActivityDetailLabel>Output</ActivityDetailLabel>
                  <ActivityDetailContent>adaptive source</ActivityDetailContent>
                </ActivityDetail>
              </ActivityContent>
            </Activity>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
    </div>
  );
}
