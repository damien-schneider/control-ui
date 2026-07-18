import { ChatInputAttachment, ChatInputAttachments } from "@/components/control-ui/chat-input-attachment";

type ComposerAttachment = {
  id: string;
  name: string;
  type?: string;
  status?: "idle" | "uploading" | "uploaded" | "error";
  progress?: number;
};

export function Example({ attachments, removeAttachment }: { attachments: ComposerAttachment[]; removeAttachment: (id: string) => void }) {
  return (
    <ChatInputAttachments>
      {attachments.map((attachment) => (
        <ChatInputAttachment
          key={attachment.id}
          name={attachment.name}
          type={attachment.type}
          status={attachment.status}
          progress={attachment.progress}
          onRemove={() => removeAttachment(attachment.id)}
        />
      ))}
    </ChatInputAttachments>
  );
}
