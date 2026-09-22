"use client";

import { PaperclipIcon } from "lucide-react";
import { useState } from "react";

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
import { type ImagePalette, readImagePalette } from "./image-palette";

const themeImagePolicy: DropzonePolicy = {
  accept: { "image/jpeg": [], "image/png": [], "image/gif": [], "image/webp": [] },
  multiple: false,
  selectionMode: "replace",
};

// A phone photo base64s past Vercel's 4.5 MB request cap and would 413 at the edge, before any handler
// could explain itself. It also carries no more theme signal than a 1024px reading of it, and the model
// bills the same ≤384 tokens either way.
const MAX_EDGE = 1024;

export type ThemeImage = { mediaType: "image/jpeg"; data: string; name: string; url: string; palette: ImagePalette | null };

type ThemeAttachment = { file: File; image: ThemeImage | null; error: string | null };

async function readThemeImage(file: File): Promise<ThemeImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable.");

  // JPEG has no alpha, and an unpainted canvas would read transparent-as-black under a light screenshot.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // The pixels are right here, so the palette is measured rather than guessed by a model that sees the
  // screenshot at roughly 150 tokens.
  const palette = readImagePalette(context.getImageData(0, 0, canvas.width, canvas.height).data);

  // The data URL doubles as the preview source, so there is no object URL to revoke later.
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { mediaType: "image/jpeg", data: dataUrl.slice(dataUrl.indexOf(",") + 1), name: file.name, url: dataUrl, palette };
}

type ThemePromptComposerProps = {
  isRunning: boolean;
  onGenerate: (prompt: string, image: ThemeImage | null) => Promise<void>;
  onStop: () => void;
};

export function ThemePromptComposer(props: ThemePromptComposerProps) {
  const [attachment, setAttachment] = useState<ThemeAttachment | null>(null);

  async function attach(file: File) {
    setAttachment({ file, image: null, error: null });
    // A truncated or mislabelled file passes the type check and only rejects once decoded.
    const settled = await readThemeImage(file).then(
      (image) => ({ file, image, error: null }),
      () => ({ file, image: null, error: "Could not be read as an image" }),
    );
    setAttachment((current) => (current?.file === file ? settled : current));
  }

  return (
    <Dropzone
      value={attachment ? [attachment.file] : []}
      onValueChange={([file]) => (file ? attach(file) : setAttachment(null))}
      policy={themeImagePolicy}
    >
      <DropzoneInput aria-label="Attach a screenshot" />
      <ThemePromptArea {...props} attachment={attachment} />
    </Dropzone>
  );
}

function ThemePromptArea({ attachment, isRunning, onGenerate, onStop }: ThemePromptComposerProps & { attachment: ThemeAttachment | null }) {
  const dropzone = useDropzoneContext();
  const hasRail = attachment !== null || dropzone.fileRejections.length > 0;

  return (
    <DropzoneArea>
      <ChatComposer
        state={isRunning ? "submitting" : "idle"}
        allowEmptySubmit={attachment?.image != null}
        onSubmit={async ({ value, clear }) => {
          const image = attachment?.image ?? null;
          clear();
          dropzone.reset();
          await onGenerate(value, image);
        }}
      >
        <ChatComposerShell>
          {hasRail ? (
            <ChatComposerAttachments>
              {attachment ? <ThemeImageAttachment attachment={attachment} onRemove={() => dropzone.removeFile(attachment.file)} /> : null}
              {dropzone.fileRejections.map(({ file, errors }) => (
                <ChatComposerAttachment
                  key={`${file.name}-${file.lastModified}`}
                  name={file.name}
                  type={file.type}
                  status="error"
                  description={errors[0]?.message}
                  onRemove={() => dropzone.removeRejection(file)}
                />
              ))}
            </ChatComposerAttachments>
          ) : null}
          <ChatComposerTextarea placeholder="Describe a mood, or paste a screenshot to match…" />
          <ChatComposerToolbar>
            <ChatComposerTools>
              <Button type="button" size="xs" variant="quiet" onClick={dropzone.open}>
                <PaperclipIcon />
                Image
              </Button>
            </ChatComposerTools>
            {isRunning ? (
              <Button type="button" size="xs" variant="quiet" onClick={onStop}>
                Stop
              </Button>
            ) : (
              <ChatComposerSubmit>Generate</ChatComposerSubmit>
            )}
          </ChatComposerToolbar>
          <DropzoneOverlay>Drop a screenshot to match</DropzoneOverlay>
        </ChatComposerShell>
      </ChatComposer>
    </DropzoneArea>
  );
}

function ThemeImageAttachment({ attachment, onRemove }: { attachment: ThemeAttachment; onRemove: () => void }) {
  const { file, image, error } = attachment;
  if (error) return <ChatComposerAttachment name={file.name} type={file.type} status="error" description={error} onRemove={onRemove} />;
  if (!image) return <ChatComposerAttachment name={file.name} type={file.type} status="uploading" onRemove={onRemove} />;
  return <ChatComposerAttachment name={file.name} type={image.mediaType} previewUrl={image.url} onRemove={onRemove} />;
}
