"use client";

import { ArrowUp, Paperclip } from "lucide-react";
import { useState } from "react";

import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";
import {
  ChatComposerAttachment,
  ChatComposerAttachmentPreview,
  ChatComposerAttachmentProgress,
  ChatComposerAttachmentRemove,
  ChatComposerAttachments,
} from "@/components/control-ui/chat-composer-attachment";
import { Button } from "@/components/control-ui/ui/button";
import {
  Dropzone,
  DropzoneArea,
  DropzoneInput,
  DropzoneOverlay,
  type DropzonePolicy,
  useDropzoneContext,
} from "@/components/control-ui/ui/dropzone";

const seededAttachments = [
  {
    id: "image",
    name: "vision-reference.png",
    type: "image/png",
    status: "uploading",
    progress: 64,
    variant: "preview",
  },
  {
    id: "pdf",
    name: "Document_de_Synthese_J0025.pdf",
    type: "application/pdf",
    status: "uploaded",
    description: "PDF",
  },
  {
    id: "sheet",
    name: "Q3_budget_forecast.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    status: "uploaded",
    description: "Spreadsheet",
  },
  {
    id: "file",
    name: "[FREE] So La Lune Type Beat.wav",
    type: "audio/wav",
    status: "idle",
    description: "File",
  },
] as const;

const attachmentPolicy: DropzonePolicy = {
  accept: {
    "image/*": [".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"],
    "application/pdf": [".pdf"],
    "text/*": [".csv", ".md", ".txt"],
  },
  maxSize: 10 * 1024 * 1024,
  maxFiles: 8,
};

export function ChatComposerAttachmentExample() {
  return (
    <Dropzone policy={attachmentPolicy} className="w-full max-w-[34rem]">
      <DropzoneInput />
      <AttachmentComposer />
    </Dropzone>
  );
}

function AttachmentComposer() {
  const dropzone = useDropzoneContext();
  const [seeded, setSeeded] = useState([...seededAttachments]);
  const attachmentCount = seeded.length + dropzone.value.length;

  function removeSeeded(id: string) {
    setSeeded((current) => current.filter((attachment) => attachment.id !== id));
  }

  return (
    <DropzoneArea>
      <ChatComposer
        allowEmptySubmit={attachmentCount > 0}
        onSubmit={({ clear }) => {
          clear();
          dropzone.reset();
          setSeeded([]);
        }}
      >
        <ChatComposerShell>
          <ChatComposerAttachments>
            {seeded.map((attachment) =>
              attachment.id === "image" ? (
                <ChatComposerAttachment
                  key={attachment.id}
                  name={attachment.name}
                  type={attachment.type}
                  status={attachment.status}
                  progress={attachment.progress}
                  variant={attachment.variant}
                  onRemove={() => removeSeeded(attachment.id)}
                >
                  <ChatComposerAttachmentPreview>
                    <div className="h-full w-auto aspect-square bg-[radial-gradient(circle_at_35%_34%,oklch(0.95_0.02_80),oklch(0.62_0.09_260)_22%,oklch(0.14_0.02_260)_68%,oklch(0.06_0.01_260))]" />
                  </ChatComposerAttachmentPreview>
                  <ChatComposerAttachmentRemove />
                  <ChatComposerAttachmentProgress />
                </ChatComposerAttachment>
              ) : (
                <ChatComposerAttachment
                  key={attachment.id}
                  name={attachment.name}
                  type={attachment.type}
                  status={attachment.status}
                  description={attachment.description}
                  onRemove={() => removeSeeded(attachment.id)}
                />
              ),
            )}
            {dropzone.value.map((file) => (
              <ChatComposerAttachment
                key={`${file.name}-${file.lastModified}-${file.size}`}
                file={file}
                status="uploaded"
                onRemove={() => dropzone.removeFile(file)}
              />
            ))}
            {dropzone.fileRejections.map(({ file, errors }) => (
              <ChatComposerAttachment
                key={`rejected-${file.name}-${file.lastModified}-${file.size}`}
                file={file}
                status="error"
                description={errors[0]?.message}
                onRemove={() => dropzone.removeRejection(file)}
              />
            ))}
          </ChatComposerAttachments>
          <ChatComposerTextarea placeholder="Ask anything — paste a screenshot or drop a file" />
          <ChatComposerToolbar>
            <ChatComposerTools>
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                aria-label="Add files"
                disabled={dropzone.disabled || dropzone.isProcessing}
                onClick={dropzone.open}
              >
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
