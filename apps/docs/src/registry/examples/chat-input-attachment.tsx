"use client";

import { useState } from "react";

import {
  ChatInputAttachment,
  ChatInputAttachmentPreview,
  ChatInputAttachmentProgress,
  ChatInputAttachmentRemove,
  ChatInputAttachments,
} from "@/components/control-ui/chat-input-attachment";

const initialAttachments = [
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

export function ChatInputAttachmentExample() {
  const [attachments, setAttachments] = useState([...initialAttachments]);

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  }

  return (
    <div className="max-w-[34rem] p-4">
      <div className="overflow-hidden rounded-field border bg-card shadow-sm">
        <ChatInputAttachments>
          {attachments.map((attachment) =>
            attachment.id === "image" ? (
              <ChatInputAttachment
                key={attachment.id}
                name={attachment.name}
                type={attachment.type}
                status={attachment.status}
                progress={attachment.progress}
                variant={attachment.variant}
                onRemove={() => removeAttachment(attachment.id)}
              >
                <ChatInputAttachmentPreview>
                  <div className="h-full w-auto aspect-square bg-[radial-gradient(circle_at_35%_34%,oklch(0.95_0.02_80),oklch(0.62_0.09_260)_22%,oklch(0.14_0.02_260)_68%,oklch(0.06_0.01_260))]" />
                </ChatInputAttachmentPreview>
                <ChatInputAttachmentRemove />
                <ChatInputAttachmentProgress />
              </ChatInputAttachment>
            ) : (
              <ChatInputAttachment
                key={attachment.id}
                name={attachment.name}
                type={attachment.type}
                status={attachment.status}
                description={attachment.description}
                onRemove={() => removeAttachment(attachment.id)}
              />
            ),
          )}
        </ChatInputAttachments>
        <div className="px-3 pb-4 pt-2 text-sm text-muted-foreground">Ask anything</div>
      </div>
    </div>
  );
}
