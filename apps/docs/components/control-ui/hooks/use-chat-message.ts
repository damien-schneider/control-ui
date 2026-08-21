import type { ComponentProps, CSSProperties } from "react";
import type { ChatMessageKnobStyle } from "@/components/control-ui/knob-contracts/chat-message-knobs";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export type ChatDensity = "compact" | "comfortable";

export type ChatState = "idle" | "streaming" | "pending" | "error";

export type ChatMessageProps = ComponentProps<"article"> & {
  from: ChatRole;
  state?: ChatState;
  density?: ChatDensity;
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
  isError: boolean;
};

function getChatMessageContext({
  from,
  state,
  density,
}: Required<Pick<ChatMessageProps, "from" | "state" | "density">>): ChatMessageContext {
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
    isError: state === "error",
  };
}

export function useChatMessage({ from, state = "idle", density = "comfortable" }: Pick<ChatMessageProps, "from" | "state" | "density">) {
  return getChatMessageContext({ from, state, density });
}
