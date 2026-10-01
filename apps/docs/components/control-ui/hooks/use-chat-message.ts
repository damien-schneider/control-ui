import type { ComponentProps, CSSProperties } from "react";
import { createContext, useContext } from "react";
import type { ChatMessageKnobStyle } from "@/components/control-ui/knob-contracts/chat-message-knobs";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export type ChatDensity = "compact" | "comfortable";

export type ChatState = "idle" | "streaming" | "pending" | "error";

/** Transition announcements a message publishes to its thread. */
export type ChatMessageStatusLabels = { pending: string; replied: string; error: string };

export type ChatMessageProps = ComponentProps<"article"> & {
  from: ChatRole;
  state?: ChatState;
  density?: ChatDensity;
  /** Accessible name of the message, so the speaker isn't conveyed by alignment and colour alone. */
  authorLabel?: string;
  statusLabels?: Partial<ChatMessageStatusLabels>;
} & { style?: CSSProperties & ChatMessageKnobStyle };

export type ChatMessageContext = {
  from: ChatRole;
  state: ChatState;
  density: ChatDensity;
  isUser: boolean;
  isAssistant: boolean;
  isSystem: boolean;
  isTool: boolean;
  isCompact: boolean;
  isStreaming: boolean;
  isPending: boolean;
  isError: boolean;
};

export const chatAuthorLabels: Record<ChatRole, string> = {
  user: "You",
  assistant: "Assistant",
  system: "System",
  tool: "Tool",
};

export const chatMessageStatusLabels: ChatMessageStatusLabels = {
  pending: "Assistant is replying",
  replied: "Assistant replied",
  error: "Reply failed",
};

export const ChatThreadAnnounceContext = createContext<(message: string) => void>(() => {});

/** Publishes a state transition (never streamed text) to the thread's one polite status region; a no-op outside `ChatThread`. */
export function useChatThreadAnnounce() {
  return useContext(ChatThreadAnnounceContext);
}

/** The announcement for a state change, or null when the change isn't worth announcing. */
export function chatMessageTransition(previous: ChatState, next: ChatState, labels: ChatMessageStatusLabels): string | null {
  if (previous === next) return null;
  if (next === "pending") return labels.pending;
  if (next === "error") return labels.error;
  if (next === "idle" && (previous === "pending" || previous === "streaming")) return labels.replied;
  return null;
}

export function useChatMessage({
  from,
  state = "idle",
  density = "comfortable",
}: Pick<ChatMessageProps, "from" | "state" | "density">): ChatMessageContext {
  return {
    from,
    state,
    density,
    isUser: from === "user",
    isAssistant: from === "assistant",
    isSystem: from === "system",
    isTool: from === "tool",
    isCompact: density === "compact",
    isStreaming: state === "streaming",
    isPending: state === "pending",
    isError: state === "error",
  };
}
