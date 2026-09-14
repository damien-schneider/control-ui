"use client";

import { useState } from "react";

import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import type { UserAskAnswers } from "@/components/control-ui/hooks/use-user-ask";
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
    <div className="flex h-[440px] flex-col justify-end">
      <div className="w-full">
        {asking ? (
          <UserAsk onComplete={completeAsk} onDismiss={() => setAsking(false)}>
            <UserAskHeader>
              <UserAskTitle />
              <UserAskPagination />
            </UserAskHeader>
            <UserAskQuestion
              id="visibility"
              title='How should the "always in view" pomodoro timer stay visible?'
              defaultValue="Persistent bar in-app"
            >
              <UserAskOption value="Persistent bar in-app" recommended>
                <UserAskOptionLabel>Persistent bar in-app</UserAskOptionLabel>
                <UserAskOptionDescription>
                  A sticky timer bar always visible at the top of the app window, no matter which task you're viewing.
                </UserAskOptionDescription>
              </UserAskOption>
              <UserAskOption value="Floating always-on-top window">
                <UserAskOptionLabel>Floating always-on-top window</UserAskOptionLabel>
                <UserAskOptionDescription>
                  A separate mini timer window that floats on top of all apps, even in the background.
                </UserAskOptionDescription>
              </UserAskOption>
              <UserAskOption value="Both">
                <UserAskOptionLabel>Both</UserAskOptionLabel>
                <UserAskOptionDescription>In-app bar plus an optional floating mini window you can pop out.</UserAskOptionDescription>
              </UserAskOption>
              <UserAskOptionInput label="Other" placeholder="Tell the agent what to do differently" />
            </UserAskQuestion>
            <UserAskQuestion id="sessions" title="Where should completed sessions be logged?">
              <UserAskOption value="On the task" recommended>
                <UserAskOptionLabel>On the task</UserAskOptionLabel>
                <UserAskOptionDescription>Each pomodoro is attached to the task it was started from.</UserAskOptionDescription>
              </UserAskOption>
              <UserAskOption value="Daily journal">
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
          <div className="grid gap-3">
            {answers ? (
              <ChatMessage from="user" aria-live="polite">
                <ChatMessageRow>
                  <ChatMessageBody>
                    <ChatMessageContent>{Object.values(answers).join(" · ")}</ChatMessageContent>
                  </ChatMessageBody>
                </ChatMessageRow>
              </ChatMessage>
            ) : (
              <p className="text-sm text-muted-foreground" role="status">
                Question dismissed
              </p>
            )}
            <Button type="button" variant="quiet" size="sm" className="justify-self-end" onClick={() => setAsking(true)}>
              Ask again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
