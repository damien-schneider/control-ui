import { ChatComposerAttachment, ChatComposerAttachments } from "@/components/control-ui/chat-composer-attachment";

type ComposerAttachment = {
  id: string;
  name: string;
  type?: string;
  status?: "idle" | "uploading" | "uploaded" | "error";
  progress?: number;
};

export function Example({ attachments, removeAttachment }: { attachments: ComposerAttachment[]; removeAttachment: (id: string) => void }) {
  return (
    <ChatComposerAttachments>
      {attachments.map((attachment) => (
        <ChatComposerAttachment
          key={attachment.id}
          name={attachment.name}
          type={attachment.type}
          status={attachment.status}
          progress={attachment.progress}
          onRemove={() => removeAttachment(attachment.id)}
        />
      ))}
    </ChatComposerAttachments>
  );
}
