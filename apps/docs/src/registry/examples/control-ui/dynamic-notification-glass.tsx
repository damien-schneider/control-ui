"use client";

import { useEffect, useRef, useState } from "react";

import {
  DynamicNotification,
  DynamicNotificationClose,
  DynamicNotificationContent,
  DynamicNotificationGlass,
  DynamicNotificationIndicator,
  DynamicNotificationIsland,
  DynamicNotificationMessage,
  DynamicNotificationPill,
  DynamicNotificationReply,
  DynamicNotificationReplyInput,
  DynamicNotificationReplySubmit,
  DynamicNotificationTitle,
} from "@/components/control-ui/dynamic-notification";
import { Button } from "@/components/control-ui/ui/button";
import { DynamicNotificationDemoBackdrop } from "./dynamic-notification-demo-backdrop";

const MESSAGES = [
  "It'll be fantastic weather for your upcoming tennis lesson this Sunday.",
  "Here, I found the door code in your messages from Mac.",
  "Your flight to Lisbon checks in at 14:05 — I filled the passport form already.",
  "Reservation moved to 8pm; I let the others know in the group chat.",
];

export function DynamicNotificationGlassExample() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastReply, setLastReply] = useState("");
  let statusMessage = "Tap the island to answer";
  if (loading) statusMessage = "Assistant is thinking…";
  else if (lastReply) statusMessage = `You replied: ${lastReply}`;
  const thinkTimer = useRef(0);

  // simulate the model answering: hold the "thinking" blob for ~2.4s, then reveal the message
  function think(nextIndex: number) {
    window.clearTimeout(thinkTimer.current);
    setMessageIndex(nextIndex);
    setOpen(true);
    setLoading(true);
    thinkTimer.current = window.setTimeout(() => setLoading(false), 2400);
  }

  useEffect(() => () => window.clearTimeout(thinkTimer.current), []);

  return (
    <div className="w-full max-w-xl p-6">
      <div
        data-dn-scene
        className="relative isolate flex min-h-72 w-full flex-col items-center overflow-hidden rounded-[var(--radius-panel)] border bg-background p-5"
      >
        <DynamicNotificationDemoBackdrop />

        <DynamicNotification
          className="absolute inset-x-0 top-4 z-10 px-5"
          variant="glass"
          open={open}
          loading={loading}
          onOpenChange={(next) => setOpen(next)}
          onReply={({ value, clear }) => {
            setLastReply(value);
            clear();
            think((messageIndex + 1) % MESSAGES.length);
          }}
        >
          <DynamicNotificationIsland>
            <DynamicNotificationGlass />
            <DynamicNotificationPill>
              <DynamicNotificationIndicator />
              Assistant
            </DynamicNotificationPill>
            <DynamicNotificationContent>
              <div className="flex items-center">
                <DynamicNotificationTitle>Assistant</DynamicNotificationTitle>
                <DynamicNotificationClose />
              </div>
              <DynamicNotificationMessage>{MESSAGES[messageIndex]}</DynamicNotificationMessage>
              <DynamicNotificationReply>
                <DynamicNotificationReplyInput placeholder="Answer…" />
                <DynamicNotificationReplySubmit />
              </DynamicNotificationReply>
            </DynamicNotificationContent>
          </DynamicNotificationIsland>
        </DynamicNotification>

        <div className="relative z-10 mt-auto flex w-full items-center justify-between gap-2">
          <Button
            variant="surface"
            size="sm"
            className="border-[oklch(1_0_0/0.45)] bg-[oklch(1_0_0/0.86)] text-[oklch(0.19_0.02_275)] shadow-sm backdrop-blur-sm hover:bg-[oklch(1_0_0/0.94)]"
            onClick={() => think((messageIndex + 1) % MESSAGES.length)}
          >
            Send a notification
          </Button>
          <span className="truncate text-meta text-white/75">{statusMessage}</span>
        </div>
      </div>
    </div>
  );
}
