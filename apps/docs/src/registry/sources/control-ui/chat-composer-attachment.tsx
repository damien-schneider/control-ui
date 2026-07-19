"use client";

import { XIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { createContext, useContext } from "react";

import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

export type ChatComposerAttachmentKind = "image" | "pdf" | "spreadsheet" | "document" | "archive" | "audio" | "video" | "file";
export type ChatComposerAttachmentStatus = "idle" | "uploading" | "uploaded" | "error";
export type ChatComposerAttachmentVariant = "auto" | "preview" | "file";

type ChatComposerAttachmentContextValue = {
  name: string;
  type?: string;
  description?: ReactNode;
  status: ChatComposerAttachmentStatus;
  progress?: number;
  previewUrl?: string;
  kind: ChatComposerAttachmentKind;
  variant: Exclude<ChatComposerAttachmentVariant, "auto">;
  extension: string;
  onRemove?: () => void;
  removeLabel?: string;
};

const ChatComposerAttachmentContext = createContext<ChatComposerAttachmentContextValue | null>(null);

function useChatComposerAttachmentContext() {
  const context = useContext(ChatComposerAttachmentContext);
  if (!context) throw new Error("ChatComposerAttachment compound components must be rendered inside <ChatComposerAttachment>.");
  return context;
}

function extensionFromName(name: string) {
  const match = name.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? "";
}

function kindFromAttachment(type: string | undefined, name: string): ChatComposerAttachmentKind {
  const mime = type?.toLowerCase() ?? "";
  const extension = extensionFromName(name);

  if (mime.startsWith("image/") || ["avif", "gif", "heic", "jpeg", "jpg", "png", "webp"].includes(extension)) return "image";
  if (mime === "application/pdf" || extension === "pdf") return "pdf";
  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    mime.includes("csv") ||
    ["csv", "numbers", "ods", "tsv", "xls", "xlsx"].includes(extension)
  ) {
    return "spreadsheet";
  }
  if (mime.startsWith("audio/") || ["aac", "flac", "m4a", "mp3", "ogg", "wav"].includes(extension)) return "audio";
  if (mime.startsWith("video/") || ["avi", "mov", "mp4", "webm"].includes(extension)) return "video";
  if (mime.includes("zip") || ["7z", "gz", "rar", "tar", "zip"].includes(extension)) return "archive";
  if (mime.includes("document") || mime.includes("text") || ["doc", "docx", "md", "rtf", "txt"].includes(extension)) return "document";
  return "file";
}

function progressValue(progress: number | undefined) {
  if (typeof progress !== "number" || Number.isNaN(progress)) return undefined;
  return Math.min(100, Math.max(0, progress));
}

function fallbackLabel(kind: ChatComposerAttachmentKind, extension: string) {
  if (extension && extension.length <= 4) return extension.toUpperCase();
  const labels: Record<ChatComposerAttachmentKind, string> = {
    image: "IMG",
    pdf: "PDF",
    spreadsheet: "XLS",
    document: "DOC",
    archive: "ZIP",
    audio: "AUD",
    video: "VID",
    file: "FILE",
  };
  return labels[kind];
}

function defaultDescription(context: ChatComposerAttachmentContextValue) {
  const progress = progressValue(context.progress);
  if (context.description) return context.description;
  if (context.status === "uploading") return `Uploading ${Math.round(progress ?? 0)}%`;
  if (context.status === "error") return "Upload failed";
  return fallbackLabel(context.kind, context.extension);
}

export type ChatComposerAttachmentsProps = ComponentProps<"div"> & {
  label?: string;
  viewportClassName?: string;
};

export function ChatComposerAttachments({
  label = "Attachments",
  className,
  viewportClassName,
  children,
  ...props
}: ChatComposerAttachmentsProps) {
  return (
    <div
      data-control-ui="chat-composer-attachments"
      data-slot="root"
      className={cn("min-w-0", skinSlot("chat-composer-attachments", "root", {}), className)}
      {...props}
    >
      <ScrollArea
        data-control-ui="chat-composer-attachments"
        data-slot="scroll"
        aria-label={label}
        lockAxis="y"
        mask
        scrollbarVisibility="hover"
        className={cn("w-full", skinSlot("chat-composer-attachments", "scroll", {}))}
        viewportClassName={cn("pb-2", viewportClassName)}
      >
        <ul
          data-control-ui="chat-composer-attachments"
          data-slot="list"
          className={cn("flex w-max min-w-full list-none gap-2 px-3 pt-3", skinSlot("chat-composer-attachments", "list", {}))}
        >
          {children}
        </ul>
      </ScrollArea>
    </div>
  );
}

export type ChatComposerAttachmentProps = ComponentProps<"li"> & {
  name: string;
  type?: string;
  description?: ReactNode;
  status?: ChatComposerAttachmentStatus;
  progress?: number;
  previewUrl?: string;
  kind?: ChatComposerAttachmentKind;
  variant?: ChatComposerAttachmentVariant;
  onRemove?: () => void;
  removeLabel?: string;
};

export function ChatComposerAttachment({
  name,
  type,
  description,
  status = "idle",
  progress: progressInput,
  previewUrl,
  kind,
  variant = "auto",
  onRemove,
  removeLabel,
  className,
  children,
  style,
  role,
  "aria-label": ariaLabel,
  ...props
}: ChatComposerAttachmentProps) {
  const resolvedKind = kind ?? kindFromAttachment(type, name);
  let resolvedVariant: Exclude<ChatComposerAttachmentVariant, "auto">;
  if (variant === "auto") resolvedVariant = previewUrl || resolvedKind === "image" ? "preview" : "file";
  else resolvedVariant = variant;
  const extension = extensionFromName(name);
  const progress = progressValue(progressInput);
  const attachmentStyle = {
    "--chat-composer-attachment-progress": `${progress ?? 0}%`,
    ...style,
  } as CSSProperties;

  return (
    <ChatComposerAttachmentContext.Provider
      value={{
        name,
        type,
        description,
        status,
        progress,
        previewUrl,
        kind: resolvedKind,
        variant: resolvedVariant,
        extension,
        onRemove,
        removeLabel,
      }}
    >
      <li
        role={role}
        aria-label={ariaLabel ?? name}
        data-control-ui="chat-composer-attachment"
        data-slot="root"
        data-surface="panel"
        data-kind={resolvedKind}
        data-state={status}
        data-variant={resolvedVariant}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-field border border-border/80 bg-card/92 text-left shadow-sm ring-1 ring-foreground/4 transition-[background-color,border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
          "data-[state=uploading]:border-primary/35 data-[state=uploading]:ring-primary/15 data-[state=error]:border-destructive/45 data-[state=error]:ring-destructive/20",
          resolvedVariant === "preview"
            ? "flex h-14 w-fit max-w-40 items-center p-1"
            : "flex h-14 w-64 max-w-[calc(100vw-5rem)] items-center gap-2 p-1.5 pr-8",
          skinSlot("chat-composer-attachment", "root", { kind: resolvedKind, status, variant: resolvedVariant }),
          className,
        )}
        style={attachmentStyle}
        {...props}
      >
        {children ?? (
          <>
            <ChatComposerAttachmentPreview />
            {resolvedVariant === "file" && (
              <ChatComposerAttachmentContent>
                <ChatComposerAttachmentTitle />
                <ChatComposerAttachmentDescription />
              </ChatComposerAttachmentContent>
            )}
            <ChatComposerAttachmentRemove />
            <ChatComposerAttachmentProgress />
          </>
        )}
      </li>
    </ChatComposerAttachmentContext.Provider>
  );
}

export type ChatComposerAttachmentPreviewProps = ComponentProps<"div">;

export function ChatComposerAttachmentPreview({ className, children, ...props }: ChatComposerAttachmentPreviewProps) {
  const context = useChatComposerAttachmentContext();
  const label = fallbackLabel(context.kind, context.extension);

  return (
    <div
      data-control-ui="chat-composer-attachment"
      data-slot="preview"
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-[calc(var(--radius-field)-0.25rem)] bg-muted text-muted-foreground",
        context.variant === "preview" ? "h-full w-fit min-w-10 max-w-full" : "size-10",
        context.kind === "pdf" && "bg-destructive/10 text-destructive-text",
        context.kind === "spreadsheet" && "bg-primary/10 text-primary-text",
        skinSlot("chat-composer-attachment", "preview", { kind: context.kind, status: context.status, variant: context.variant }),
        className,
      )}
      {...props}
    >
      {children ??
        (context.previewUrl ? (
          <img
            src={context.previewUrl}
            alt={context.name}
            loading="lazy"
            decoding="async"
            className="h-full w-auto max-w-full object-contain"
          />
        ) : (
          <span className="text-micro font-semibold uppercase">{label}</span>
        ))}
      {context.status === "uploading" && (
        <span
          aria-hidden="true"
          data-control-ui="chat-composer-attachment"
          data-slot="status"
          className={cn(
            "absolute right-1 top-1 size-4 rounded-full border-2 border-background/75 border-t-primary animate-spin",
            skinSlot("chat-composer-attachment", "status", { status: context.status }),
          )}
        />
      )}
    </div>
  );
}

export type ChatComposerAttachmentContentProps = ComponentProps<"div">;

export function ChatComposerAttachmentContent({ className, ...props }: ChatComposerAttachmentContentProps) {
  return (
    <div
      data-control-ui="chat-composer-attachment"
      data-slot="content"
      className={cn("min-w-0 flex-1", skinSlot("chat-composer-attachment", "content", {}), className)}
      {...props}
    />
  );
}

export type ChatComposerAttachmentTitleProps = ComponentProps<"div">;

export function ChatComposerAttachmentTitle({ className, children, ...props }: ChatComposerAttachmentTitleProps) {
  const { name } = useChatComposerAttachmentContext();

  return (
    <div
      data-control-ui="chat-composer-attachment"
      data-slot="title"
      className={cn("truncate text-label font-medium text-foreground", skinSlot("chat-composer-attachment", "title", {}), className)}
      {...props}
    >
      {children ?? name}
    </div>
  );
}

export type ChatComposerAttachmentDescriptionProps = ComponentProps<"div">;

export function ChatComposerAttachmentDescription({ className, children, ...props }: ChatComposerAttachmentDescriptionProps) {
  const context = useChatComposerAttachmentContext();

  return (
    <div
      data-control-ui="chat-composer-attachment"
      data-slot="description"
      className={cn(
        "truncate text-meta text-muted-foreground data-[state=error]:text-destructive-text",
        skinSlot("chat-composer-attachment", "description", { status: context.status }),
        className,
      )}
      data-state={context.status}
      {...props}
    >
      {children ?? defaultDescription(context)}
    </div>
  );
}

export type ChatComposerAttachmentRemoveProps = ComponentProps<typeof Button>;

export function ChatComposerAttachmentRemove({
  className,
  onClick,
  children,
  "aria-label": ariaLabel,
  ...props
}: ChatComposerAttachmentRemoveProps) {
  const { name, onRemove, removeLabel } = useChatComposerAttachmentContext();

  if (!onRemove) return null;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) onRemove?.();
  }

  return (
    <Button
      data-control-ui="chat-composer-attachment"
      data-slot="remove"
      aria-label={ariaLabel ?? removeLabel ?? `Remove ${name}`}
      size="xs"
      variant="solid"
      className={cn(
        "absolute right-1 top-1 z-10 size-5 rounded-full bg-foreground p-0 text-background shadow-sm hover:bg-foreground/85",
        skinSlot("chat-composer-attachment", "remove", {}),
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="size-3" />}
    </Button>
  );
}

export type ChatComposerAttachmentProgressProps = ComponentProps<"div">;

export function ChatComposerAttachmentProgress({ className, children, ...props }: ChatComposerAttachmentProgressProps) {
  const { status, progress } = useChatComposerAttachmentContext();

  if (status !== "uploading" && progress == null) return null;

  return (
    <div
      aria-hidden="true"
      data-control-ui="chat-composer-attachment"
      data-slot="progress"
      className={cn("absolute inset-x-0 bottom-0 h-1 bg-foreground/10", skinSlot("chat-composer-attachment", "progress", {}), className)}
      {...props}
    >
      {children ?? (
        <div
          data-control-ui="chat-composer-attachment"
          data-slot="progress-indicator"
          className={cn(
            "h-full w-[var(--chat-composer-attachment-progress)] rounded-full bg-primary transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)]",
            skinSlot("chat-composer-attachment", "progress-indicator", {}),
          )}
        />
      )}
    </div>
  );
}
