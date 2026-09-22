"use client";

import { useChat } from "@mastra/react";
import { ArrowUp, Paperclip } from "lucide-react";

import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";
import { ChatComposerAttachment, ChatComposerAttachments } from "@/components/control-ui/chat-composer-attachment";
import { Button } from "@/components/control-ui/ui/button";
import {
  Dropzone,
  DropzoneArea,
  DropzoneInput,
  DropzoneOverlay,
  type DropzonePolicy,
  useDropzoneContext,
} from "@/components/control-ui/ui/dropzone";

const policy: DropzonePolicy = {
  accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"], "application/pdf": [".pdf"] },
  maxSize: 10 * 1024 * 1024,
};

function readBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function toFilePart(file: File) {
  return { type: "file" as const, data: await readBase64(file), mimeType: file.type, filename: file.name };
}

export function Example({ agentId }: { agentId: string }) {
  return (
    <Dropzone policy={policy}>
      <DropzoneInput />
      <AttachmentComposer agentId={agentId} />
    </Dropzone>
  );
}

function AttachmentComposer({ agentId }: { agentId: string }) {
  const { sendMessage, isRunning } = useChat({ agentId });
  const dropzone = useDropzoneContext();

  async function sendWithFiles(text: string) {
    const content = await Promise.all(dropzone.value.map(toFilePart));
    await sendMessage({ message: text, coreUserMessages: content.length > 0 ? [{ role: "user", content }] : undefined });
  }

  return (
    <DropzoneArea>
      <ChatComposer
        state={isRunning ? "submitting" : "idle"}
        allowEmptySubmit={dropzone.value.length > 0}
        onSubmit={async ({ value, clear }) => {
          await sendWithFiles(value);
          clear();
          dropzone.reset();
        }}
      >
        <ChatComposerShell>
          <ChatComposerAttachments>
            {dropzone.value.map((file) => (
              <ChatComposerAttachment
                key={`${file.name}-${file.lastModified}-${file.size}`}
                name={file.name}
                type={file.type}
                onRemove={() => dropzone.removeFile(file)}
              />
            ))}
            {dropzone.fileRejections.map(({ file, errors }) => (
              <ChatComposerAttachment
                key={`rejected-${file.name}-${file.lastModified}-${file.size}`}
                name={file.name}
                type={file.type}
                status="error"
                description={errors[0]?.message}
                onRemove={() => dropzone.removeRejection(file)}
              />
            ))}
          </ChatComposerAttachments>
          <ChatComposerTextarea placeholder="Ask anything — paste a screenshot or drop a file" />
          <ChatComposerToolbar>
            <ChatComposerTools>
              <Button variant="ghost" size="xs" iconOnly aria-label="Add files" onClick={dropzone.open}>
                <Paperclip className="size-4" />
              </Button>
            </ChatComposerTools>
            <ChatComposerSubmit size="sm" iconOnly aria-label="Send message">
              <ArrowUp className="size-4" />
            </ChatComposerSubmit>
          </ChatComposerToolbar>
          <DropzoneOverlay>Drop to attach</DropzoneOverlay>
        </ChatComposerShell>
      </ChatComposer>
    </DropzoneArea>
  );
}
