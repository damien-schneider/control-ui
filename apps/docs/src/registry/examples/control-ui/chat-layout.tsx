import { ActionBar, ActionBarCopy } from "@/components/control-ui/action-bar";
import { Activity, ActivityContent, ActivityIcon, ActivityTitle, ActivityTrigger } from "@/components/control-ui/activity";
import { ChatLayout, ChatThread, ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageHeader, ChatMessageRow } from "@/components/control-ui/chat-message";

const question = "Can the conversation scroll beneath the composer?";

export function ChatLayoutExample() {
  return (
    <ChatLayout className="min-h-80">
      <ChatThread>
        <ChatTurn from="user">
          <ChatMessage from="user" density="compact">
            <ChatMessageRow>
              <ChatMessageBody>
                <ChatMessageContent>{question}</ChatMessageContent>
              </ChatMessageBody>
            </ChatMessageRow>
          </ChatMessage>
          <ActionBar align="end" label="Your message actions" copyValue={question}>
            <ActionBarCopy />
          </ActionBar>
        </ChatTurn>
        <ChatTurn from="assistant">
          <Activity kind="reasoning" state="success">
            <ActivityTrigger>
              <ActivityIcon />
              <ActivityTitle>Thought for 2 seconds</ActivityTitle>
            </ActivityTrigger>
            <ActivityContent>Keep each turn in the conversation and let the composer stay within the scroll area.</ActivityContent>
          </Activity>
          <ChatMessage from="assistant" density="compact">
            <ChatMessageRow>
              <ChatMessageBody>
                <ChatMessageHeader>Assistant</ChatMessageHeader>
                <ChatMessageContent>Yes. The composer stays at the bottom while earlier messages scroll behind it.</ChatMessageContent>
              </ChatMessageBody>
            </ChatMessageRow>
          </ChatMessage>
        </ChatTurn>
      </ChatThread>
    </ChatLayout>
  );
}
