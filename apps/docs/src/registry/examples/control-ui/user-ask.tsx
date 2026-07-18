"use client";

import { useState } from "react";

import {
  ChatInput,
  ChatInputAccent,
  ChatInputShell,
  ChatInputSubmit,
  ChatInputTextarea,
  ChatInputToolbar,
  ChatInputTools,
} from "@/components/control-ui/chat-input";
import type { UserAskAnswers } from "@/components/control-ui/contracts";
import { Button } from "@/components/control-ui/ui/button";
import {
  UserAsk,
  UserAskDismiss,
  UserAskFooter,
  UserAskHeader,
  UserAskOption,
  UserAskOptionDescription,
  UserAskOptionInput,
  UserAskOptionLabel,
  UserAskPagination,
  UserAskQuestion,
  UserAskSubmit,
  UserAskTitle,
} from "@/components/control-ui/user-ask";

export function UserAskExample() {
  const [asking, setAsking] = useState(true);
  const [answers, setAnswers] = useState<UserAskAnswers | null>(null);

  function completeAsk(nextAnswers: UserAskAnswers) {
    setAnswers(nextAnswers);
    setAsking(false);
  }

  return (
    <div className="flex h-[440px] flex-col justify-end p-5">
      <div className="w-full">
        {asking ? (
          <UserAsk autoFocus onComplete={completeAsk} onDismiss={() => setAsking(false)}>
            <UserAskHeader>
              <UserAskTitle />
              <UserAskPagination />
            </UserAskHeader>
            <UserAskQuestion id="visibility" title='How should the "always in view" pomodoro timer stay visible?' defaultValue="bar">
              <UserAskOption value="bar" recommended>
                <UserAskOptionLabel>Persistent bar in-app</UserAskOptionLabel>
                <UserAskOptionDescription>
                  A sticky timer bar always visible at the top of the app window, no matter which task you're viewing.
                </UserAskOptionDescription>
              </UserAskOption>
              <UserAskOption value="floating">
                <UserAskOptionLabel>Floating always-on-top window</UserAskOptionLabel>
                <UserAskOptionDescription>
                  A separate mini timer window that floats on top of all apps, even in the background.
                </UserAskOptionDescription>
              </UserAskOption>
              <UserAskOption value="both">
                <UserAskOptionLabel>Both</UserAskOptionLabel>
                <UserAskOptionDescription>In-app bar plus an optional floating mini window you can pop out.</UserAskOptionDescription>
              </UserAskOption>
              <UserAskOptionInput label="Other" placeholder="Tell the agent what to do differently" />
            </UserAskQuestion>
            <UserAskQuestion id="sessions" title="Where should completed sessions be logged?">
              <UserAskOption value="task" recommended>
                <UserAskOptionLabel>On the task</UserAskOptionLabel>
                <UserAskOptionDescription>Each pomodoro is attached to the task it was started from.</UserAskOptionDescription>
              </UserAskOption>
              <UserAskOption value="journal">
                <UserAskOptionLabel>Daily journal</UserAskOptionLabel>
                <UserAskOptionDescription>A per-day log of every session, independent of tasks.</UserAskOptionDescription>
              </UserAskOption>
            </UserAskQuestion>
            <UserAskFooter>
              <UserAskDismiss />
              <UserAskSubmit />
            </UserAskFooter>
          </UserAsk>
        ) : (
          <ChatInput density="compact">
            <ChatInputShell>
              <ChatInputAccent />
              <ChatInputTextarea placeholder="Message the agent..." />
              <ChatInputToolbar>
                <ChatInputTools>
                  {answers ? (
                    <span className="truncate">Answered: {Object.values(answers).join(" · ")}</span>
                  ) : (
                    <span>Question dismissed</span>
                  )}
                </ChatInputTools>
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="quiet" size="xs" onClick={() => setAsking(true)}>
                    Ask again
                  </Button>
                  <ChatInputSubmit>Send</ChatInputSubmit>
                </div>
              </ChatInputToolbar>
            </ChatInputShell>
          </ChatInput>
        )}
      </div>
    </div>
  );
}
