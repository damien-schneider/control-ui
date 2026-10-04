"use client";

import { useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  CodeIcon,
  Heading2Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  RedoIcon,
  SquareCodeIcon,
  StrikethroughIcon,
  UndoIcon,
} from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";
import { ChatComposerAttachment, ChatComposerAttachments } from "@/components/control-ui/chat-composer-attachment";
import { Button } from "@/components/control-ui/ui/button";
import { Input } from "@/components/control-ui/ui/input";
import { Label } from "@/components/control-ui/ui/label";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/control-ui/ui/popover";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";
import { useMarkdownEditor } from "./context";
import { isEditorUrl } from "./extensions";
import { markdownImageTypes } from "./uploads";

export function MarkdownEditorToolbar({ children }: { children?: ReactNode }) {
  const { editor, disabled, source, sourceRequired, setSource, uploads } = useMarkdownEditor();
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold"),
      italic: current?.isActive("italic"),
      strike: current?.isActive("strike"),
      code: current?.isActive("code"),
      heading: current?.isActive("heading", { level: 2 }),
      bulletList: current?.isActive("bulletList"),
      orderedList: current?.isActive("orderedList"),
      taskList: current?.isActive("taskList"),
      blockquote: current?.isActive("blockquote"),
      codeBlock: current?.isActive("codeBlock"),
      undo: current?.can().undo(),
      redo: current?.can().redo(),
    }),
  });
  const actions = [
    { label: "Bold", Icon: BoldIcon, active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { label: "Italic", Icon: ItalicIcon, active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Strikethrough", Icon: StrikethroughIcon, active: state?.strike, run: () => editor?.chain().focus().toggleStrike().run() },
    { label: "Inline code", Icon: CodeIcon, active: state?.code, run: () => editor?.chain().focus().toggleCode().run() },
    { label: "Heading", Icon: Heading2Icon, active: state?.heading, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Bullet list", Icon: ListIcon, active: state?.bulletList, run: () => editor?.chain().focus().toggleBulletList().run() },
    {
      label: "Numbered list",
      Icon: ListOrderedIcon,
      active: state?.orderedList,
      run: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    { label: "Task list", Icon: ListChecksIcon, active: state?.taskList, run: () => editor?.chain().focus().toggleTaskList().run() },
    { label: "Quote", Icon: QuoteIcon, active: state?.blockquote, run: () => editor?.chain().focus().toggleBlockquote().run() },
    { label: "Code block", Icon: SquareCodeIcon, active: state?.codeBlock, run: () => editor?.chain().focus().toggleCodeBlock().run() },
  ];
  return (
    <TooltipProvider>
      <Toolbar aria-label="Markdown formatting" chrome="embedded" className="flex w-full flex-wrap">
        {actions.map(({ label, Icon, active, run }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <ToolbarButton
                  type="button"
                  iconOnly
                  aria-label={label}
                  aria-pressed={Boolean(active)}
                  disabled={disabled || source || !editor}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={run}
                />
              }
            >
              <Icon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
        <MarkdownEditorLink />
        <MarkdownEditorImage />
        <ToolbarSeparator />
        <ToolbarButton
          type="button"
          iconOnly
          aria-label="Undo"
          disabled={disabled || source || !state?.undo}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <UndoIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          type="button"
          iconOnly
          aria-label="Redo"
          disabled={disabled || source || !state?.redo}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <RedoIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          type="button"
          aria-pressed={source}
          disabled={disabled || !editor || sourceRequired || uploads.length > 0}
          onClick={() => setSource(!source)}
        >
          Markdown source
        </ToolbarButton>
        {children}
      </Toolbar>
    </TooltipProvider>
  );
}

export function MarkdownEditorLink() {
  const { editor, disabled, source } = useMarkdownEditor();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const inputId = useId();
  const valid = isEditorUrl(url.trim());
  function apply() {
    if (!valid || disabled || source) return;
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    setOpen(false);
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setUrl(editor?.getAttributes("link").href ?? "");
      }}
    >
      <PopoverTrigger disabled={disabled || source || !editor} render={<ToolbarButton type="button" iconOnly aria-label="Edit link" />}>
        <LinkIcon aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        className="grid gap-3"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            apply();
          }
        }}
      >
        <PopoverTitle>Edit link</PopoverTitle>
        <Label htmlFor={inputId}>URL</Label>
        <Input id={inputId} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" />
        <div className="flex gap-2">
          <Button type="button" disabled={!valid || disabled} onClick={apply}>
            Apply link
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => {
              editor?.chain().focus().extendMarkRange("link").unsetLink().run();
              setOpen(false);
            }}
          >
            Remove link
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function MarkdownEditorImage() {
  const { editor, disabled, source, canUpload, upload } = useMarkdownEditor();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const inputId = useId();
  const altId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const valid = isEditorUrl(url.trim(), true);
  function insert() {
    if (!valid || disabled || source) return;
    editor?.chain().focus().setImage({ src: url.trim(), alt }).run();
    setOpen(false);
    setUrl("");
    setAlt("");
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger disabled={disabled || source || !editor} render={<ToolbarButton type="button" iconOnly aria-label="Insert image" />}>
        <ImageIcon aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        className="grid gap-3"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            insert();
          }
        }}
      >
        <PopoverTitle>Insert image</PopoverTitle>
        <Label htmlFor={inputId}>Image URL</Label>
        <Input id={inputId} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/image.png" />
        <Label htmlFor={altId}>Image description</Label>
        <Input id={altId} value={alt} onChange={(event) => setAlt(event.target.value)} />
        <Button type="button" disabled={!valid || disabled} onClick={insert}>
          Insert image
        </Button>
        {canUpload ? (
          <>
            <input
              ref={fileInput}
              type="file"
              accept={markdownImageTypes.join(",")}
              multiple
              hidden
              onChange={(event) => {
                upload(Array.from(event.target.files ?? []));
                event.target.value = "";
                setOpen(false);
              }}
            />
            <Button type="button" variant="ghost" disabled={disabled} onClick={() => fileInput.current?.click()}>
              Upload images
            </Button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function MarkdownEditorUploads() {
  const { uploads, uploadError, retryUpload, removeUpload, disabled } = useMarkdownEditor();
  return (
    <>
      {uploadError ? <p role="alert">{uploadError}</p> : null}
      {uploads.length > 0 ? (
        <div data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="uploads">
          <ChatComposerAttachments label="Image uploads">
            {uploads.map((item) => (
              <ChatComposerAttachment
                key={item.id}
                file={item.file}
                status={item.status}
                progress={item.progress}
                onRemove={disabled ? undefined : () => removeUpload(item.id)}
                removeLabel={`Remove ${item.file.name}`}
              />
            ))}
          </ChatComposerAttachments>
          {uploads
            .filter((item) => item.status === "error")
            .map((item) => (
              <div key={item.id} role="alert" className="flex items-center gap-2">
                <span>
                  {item.file.name}: {item.error}
                </span>
                <Button type="button" size="xs" disabled={disabled} onClick={() => retryUpload(item.id)}>
                  Retry upload
                </Button>
              </div>
            ))}
        </div>
      ) : null}
    </>
  );
}
