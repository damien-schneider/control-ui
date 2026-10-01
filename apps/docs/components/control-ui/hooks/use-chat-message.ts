import type { ComponentProps, CSSProperties } from "react";
import { createContext, useContext } from "react";
import type { ChatMessageKnobStyle } from "@/components/control-ui/knob-contracts/chat-message-knobs";

export type ChatRole = "user" | "assistant" | "participant" | "system" | "tool";

export type ChatDensity = "compact" | "comfortable";

export type ChatState = "idle" | "streaming" | "pending" | "error";

export type ChatMessageLayout = "bubble" | "flat";

/** Transition announcements a message publishes to its thread. */
export type ChatMessageStatusLabels = { pending: string; replied: string; error: string };

export type ChatMessageProps = ComponentProps<"article"> & {
  from: ChatRole;
  state?: ChatState;
  density?: ChatDensity;
  layout?: ChatMessageLayout;
  continuation?: boolean;
  /** Accessible name of the message, so the speaker isn't conveyed by alignment and colour alone. */
  authorLabel?: string;
  statusLabels?: Partial<ChatMessageStatusLabels>;
} & { style?: CSSProperties & ChatMessageKnobStyle };

export type ChatMessageContext = {
  from: ChatRole;
  state: ChatState;
  density: ChatDensity;
  layout: ChatMessageLayout;
  continuation: boolean;
  isUser: boolean;
  isAssistant: boolean;
  isParticipant: boolean;
  isSystem: boolean;
  isTool: boolean;
  isCompact: boolean;
  isStreaming: boolean;
  isPending: boolean;
  isError: boolean;
  isEndAligned: boolean;
  isBubble: boolean;
};

export const chatAuthorLabels: Record<ChatRole, string> = {
  user: "You",
  assistant: "Assistant",
  participant: "Participant",
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

const ChatMessageStateContext = createContext<ChatMessageContext | null>(null);

export const ChatMessageStateProvider = ChatMessageStateContext.Provider;

export function useChatMessageContext() {
  const context = useContext(ChatMessageStateContext);
  if (!context) throw new Error("ChatMessage compound components must be rendered inside <ChatMessage>.");
  return context;
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
  layout = "bubble",
  continuation = false,
}: Pick<ChatMessageProps, "from" | "state" | "density" | "layout" | "continuation">): ChatMessageContext {
  return {
    from,
    state,
    density,
    layout,
    continuation,
    isUser: from === "user",
    isAssistant: from === "assistant",
    isParticipant: from === "participant",
    isSystem: from === "system",
    isTool: from === "tool",
    isCompact: density === "compact",
    isStreaming: state === "streaming",
    isPending: state === "pending",
    isError: state === "error",
    isEndAligned: from === "user" && layout === "bubble",
    isBubble: layout === "bubble" && (from === "user" || from === "participant"),
  };
}
