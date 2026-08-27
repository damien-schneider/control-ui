import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { TranscriptDivider } from "@/components/control-ui/transcript-divider";

export function TranscriptDividerExample() {
  return (
    <div className="mx-auto grid w-full max-w-md gap-1">
      <ChatMessage from="user">
        <ChatMessageRow>
          <ChatMessageBody>
            <ChatMessageContent>Keep migrating the remaining routes.</ChatMessageContent>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
      <TranscriptDivider>Context condensed — 42 messages summarized</TranscriptDivider>
      <ChatMessage from="assistant">
        <ChatMessageRow>
          <ChatMessageBody>
            <ChatMessageContent>Resuming from the condensed summary: three routes are left.</ChatMessageContent>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
      <TranscriptDivider tone="warning">Run interrupted</TranscriptDivider>
      <TranscriptDivider tone="danger">Run failed — provider returned an error</TranscriptDivider>
      <TranscriptDivider />
    </div>
  );
}
