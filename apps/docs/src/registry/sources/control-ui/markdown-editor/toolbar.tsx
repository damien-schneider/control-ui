"use client";

import { useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  ChevronDownIcon,
  CodeIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/control-ui/ui/dropdown-menu";
import { Input } from "@/components/control-ui/ui/input";
import { Label } from "@/components/control-ui/ui/label";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/control-ui/ui/popover";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";
import { Text } from "@/components/control-ui/ui/typography";
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
      <div data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="toolbar">
        <ScrollArea lockAxis="y" mask={false} blur={false}>
          <Toolbar aria-label="Markdown formatting" chrome="embedded" className="flex w-max min-w-full">
            <MarkdownEditorHeading />
            <ToolbarSeparator />
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
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

function MarkdownEditorHeading() {
  const { editor, disabled, source } = useMarkdownEditor();
  const level = useEditorState({
    editor,
    selector: ({ editor: current }) => (current?.isActive("heading") ? String(current.getAttributes("heading").level) : "paragraph"),
  });
  return (
    <DropdownMenu>
      <ToolbarButton type="button" aria-label="Text style" disabled={disabled || source || !editor} render={<DropdownMenuTrigger />}>
        <span>{level && level !== "paragraph" ? `H${level}` : "Text"}</span>
        <ChevronDownIcon aria-hidden="true" />
      </ToolbarButton>
      <DropdownMenuContent finalFocus={() => editor?.view.dom ?? true}>
        <DropdownMenuRadioGroup
          value={level ?? "paragraph"}
          onValueChange={(value) => {
            if (!editor || disabled || source) return;
            const heading = ([1, 2, 3, 4, 5, 6] as const).find((item) => String(item) === value);
            if (heading) editor.chain().focus().setHeading({ level: heading }).run();
            else editor.chain().focus().setParagraph().run();
          }}
        >
          <DropdownMenuRadioItem value="paragraph" closeOnClick>
            Paragraph
          </DropdownMenuRadioItem>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <DropdownMenuRadioItem key={item} value={String(item)} closeOnClick>
              Heading {item}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
      <Tooltip>
        <TooltipTrigger
          render={
            <ToolbarButton
              type="button"
              iconOnly
              aria-label="Edit link"
              disabled={disabled || source || !editor}
              render={<PopoverTrigger />}
            />
          }
        >
          <LinkIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Edit link</TooltipContent>
      </Tooltip>
      <PopoverContent
        finalFocus={() => editor?.view.dom ?? true}
        className="grid gap-3"
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.target instanceof HTMLInputElement && !event.nativeEvent.isComposing) {
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
      <Tooltip>
        <TooltipTrigger
          render={
            <ToolbarButton
              type="button"
              iconOnly
              aria-label="Insert image"
              disabled={disabled || source || !editor}
              render={<PopoverTrigger />}
            />
          }
        >
          <ImageIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Insert image</TooltipContent>
      </Tooltip>
      <PopoverContent
        finalFocus={() => editor?.view.dom ?? true}
        className="grid gap-3"
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.target instanceof HTMLInputElement && !event.nativeEvent.isComposing) {
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
      {uploadError ? (
        <Text as="p" role="alert">
          {uploadError}
        </Text>
      ) : null}
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
