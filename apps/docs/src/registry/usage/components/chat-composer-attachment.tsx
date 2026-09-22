import { ChatComposer, ChatComposerShell, ChatComposerSubmit, ChatComposerTextarea } from "@/components/control-ui/chat-composer";
import { ChatComposerAttachment, ChatComposerAttachments } from "@/components/control-ui/chat-composer-attachment";
import { Dropzone, DropzoneArea, DropzoneInput, DropzoneOverlay, type DropzonePolicy } from "@/components/control-ui/ui/dropzone";

const policy: DropzonePolicy = {
  accept: { "image/*": [".png", ".jpg", ".webp"], "application/pdf": [".pdf"] },
  maxSize: 10 * 1024 * 1024,
};

type ComposerAttachment = {
  id: string;
  file: File;
  status?: "idle" | "uploading" | "uploaded" | "error";
  progress?: number;
  previewUrl?: string;
};

export function Example({
  attachments,
  addFiles,
  removeAttachment,
  sendMessage,
}: {
  attachments: ComposerAttachment[];
  addFiles: (files: readonly File[]) => void;
  removeAttachment: (id: string) => void;
  sendMessage: (text: string) => void;
}) {
  return (
    <Dropzone policy={policy} onDrop={({ acceptedFiles }) => addFiles(acceptedFiles)}>
      <DropzoneInput />
      {/* Drop and paste both come from the area — the composer inside it needs no handlers. */}
      <DropzoneArea>
        <ChatComposer
          allowEmptySubmit={attachments.length > 0}
          onSubmit={({ value, clear }) => {
            sendMessage(value);
            clear();
          }}
        >
          <ChatComposerShell>
            <ChatComposerAttachments>
              {attachments.map((attachment) => (
                <ChatComposerAttachment
                  key={attachment.id}
                  name={attachment.file.name}
                  type={attachment.file.type}
                  status={attachment.status}
                  progress={attachment.progress}
                  previewUrl={attachment.previewUrl}
                  onRemove={() => removeAttachment(attachment.id)}
                />
              ))}
            </ChatComposerAttachments>
            <ChatComposerTextarea placeholder="Ask anything — paste a screenshot or drop a file" />
            <ChatComposerSubmit />
            <DropzoneOverlay style={{ "--cui-dropzone-surface-radius": "var(--cui-chat-composer-shell-radius)" }}>
              Drop to attach
            </DropzoneOverlay>
          </ChatComposerShell>
        </ChatComposer>
      </DropzoneArea>
    </Dropzone>
  );
}
