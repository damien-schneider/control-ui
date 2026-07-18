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
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageHeader, ChatMessageRow } from "@/components/control-ui/chat-message";

export function ChatMessageExample() {
  return (
    <div className="p-6">
      <ChatMessage from="user">
        <ChatMessageRow>
          <ChatMessageBody>
            <ChatMessageContent>Does this render the active setup?</ChatMessageContent>
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
                  <ActivityDetailContent className="font-mono text-caption">{`{ "surface": "control-ui" }`}</ActivityDetailContent>
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
