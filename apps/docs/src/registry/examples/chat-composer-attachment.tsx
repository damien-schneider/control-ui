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
  type DropzoneFileRejection,
  DropzoneInput,
  DropzoneOverlay,
  type DropzonePolicy,
  type DropzoneValueChangeDetails,
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

const previewUrls = new WeakMap<File, string>();

export function ChatComposerAttachmentExample() {
  const [files, setFiles] = useState<readonly File[]>([]);
  const [rejections, setRejections] = useState<readonly DropzoneFileRejection[]>([]);

  function syncFiles(next: readonly File[], { addedFiles, removedFiles }: DropzoneValueChangeDetails) {
    for (const file of addedFiles) {
      if (file.type.startsWith("image/")) previewUrls.set(file, URL.createObjectURL(file));
    }
    for (const file of removedFiles) {
      const url = previewUrls.get(file);
      if (url) URL.revokeObjectURL(url);
      previewUrls.delete(file);
    }
    setFiles(next);
  }

  return (
    <Dropzone
      value={files}
      onValueChange={syncFiles}
      policy={attachmentPolicy}
      onDrop={({ fileRejections }) => setRejections(fileRejections)}
      className="w-full max-w-[34rem]"
    >
      <DropzoneInput />
      <AttachmentComposer onSend={() => setRejections([])} />
      {rejections.length > 0 ? (
        <p role="alert" className="mt-2 text-sm text-destructive-text">
          {rejections.map((rejection) => `${rejection.file.name}: ${rejection.errors[0]?.message}`).join(" · ")}
        </p>
      ) : null}
    </Dropzone>
  );
}

function AttachmentComposer({ onSend }: { onSend: () => void }) {
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
          dropzone.clearFiles();
          setSeeded([]);
          onSend();
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
                name={file.name}
                type={file.type}
                status="uploaded"
                previewUrl={previewUrls.get(file)}
                onRemove={() => dropzone.removeFile(file)}
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
          <DropzoneOverlay style={{ "--cui-dropzone-surface-radius": "var(--cui-chat-composer-shell-radius)" }}>
            Drop to attach
          </DropzoneOverlay>
        </ChatComposerShell>
      </ChatComposer>
    </DropzoneArea>
  );
}
