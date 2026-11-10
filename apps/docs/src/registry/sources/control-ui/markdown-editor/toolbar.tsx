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
import { type ComponentProps, type MouseEventHandler, type ReactNode, useId, useRef, useState } from "react";
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
import { markdownImageTypes } from "./uploads";

type MarkdownEditorFormatAction = { label: string; Icon: typeof BoldIcon; active: boolean; run: () => void };

export function useMarkdownEditorFormatActions() {
  const { editor, labels } = useMarkdownEditor();
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: Boolean(current?.isActive("bold")),
      italic: Boolean(current?.isActive("italic")),
      strike: Boolean(current?.isActive("strike")),
      code: Boolean(current?.isActive("code")),
      bulletList: Boolean(current?.isActive("bulletList")),
      orderedList: Boolean(current?.isActive("orderedList")),
      taskList: Boolean(current?.isActive("taskList")),
      blockquote: Boolean(current?.isActive("blockquote")),
      codeBlock: Boolean(current?.isActive("codeBlock")),
    }),
  });
  const focused = () => editor?.chain().focus();
  const marks: MarkdownEditorFormatAction[] = [
    { label: labels.bold, Icon: BoldIcon, active: Boolean(state?.bold), run: () => focused()?.toggleBold().run() },
    { label: labels.italic, Icon: ItalicIcon, active: Boolean(state?.italic), run: () => focused()?.toggleItalic().run() },
    { label: labels.strikethrough, Icon: StrikethroughIcon, active: Boolean(state?.strike), run: () => focused()?.toggleStrike().run() },
    { label: labels.inlineCode, Icon: CodeIcon, active: Boolean(state?.code), run: () => focused()?.toggleCode().run() },
  ];
  const blocks: MarkdownEditorFormatAction[] = [
    { label: labels.bulletList, Icon: ListIcon, active: Boolean(state?.bulletList), run: () => focused()?.toggleBulletList().run() },
    {
      label: labels.orderedList,
      Icon: ListOrderedIcon,
      active: Boolean(state?.orderedList),
      run: () => focused()?.toggleOrderedList().run(),
    },
    { label: labels.taskList, Icon: ListChecksIcon, active: Boolean(state?.taskList), run: () => focused()?.toggleTaskList().run() },
    { label: labels.quote, Icon: QuoteIcon, active: Boolean(state?.blockquote), run: () => focused()?.toggleBlockquote().run() },
    { label: labels.codeBlock, Icon: SquareCodeIcon, active: Boolean(state?.codeBlock), run: () => focused()?.toggleCodeBlock().run() },
  ];
  return { marks, blocks };
}

export function MarkdownEditorFormatButton({
  action,
  onMouseDown,
}: {
  action: MarkdownEditorFormatAction;
  onMouseDown?: MouseEventHandler<HTMLButtonElement>;
}) {
  const { editable } = useMarkdownEditor();
  const { label, Icon, active, run } = action;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToolbarButton
            type="button"
            iconOnly
            aria-label={label}
            aria-pressed={active}
            disabled={!editable}
            onMouseDown={onMouseDown}
            onClick={run}
          />
        }
      >
        <Icon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function MarkdownEditorHistoryButton({
  label,
  Icon,
  disabled,
  onClick,
}: {
  label: string;
  Icon: typeof UndoIcon;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<ToolbarButton type="button" iconOnly aria-label={label} disabled={disabled} onClick={onClick} />}>
        <Icon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function MarkdownEditorToolbar({ children }: { children?: ReactNode }) {
  const { editor, disabled, editable, labels, source, sourceRequired, setSource, uploads } = useMarkdownEditor();
  const { marks, blocks } = useMarkdownEditorFormatActions();
  const history = useEditorState({
    editor,
    selector: ({ editor: current }) => ({ undo: current?.can().undo(), redo: current?.can().redo() }),
  });
  return (
    <TooltipProvider>
      <div data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="toolbar">
        <ScrollArea lockAxis="y" mask={false} blur={false}>
          <Toolbar aria-label={labels.toolbar} chrome="embedded" className="flex w-max min-w-full">
            <MarkdownEditorHeading />
            <ToolbarSeparator />
            {[...marks, ...blocks].map((action) => (
              <MarkdownEditorFormatButton key={action.label} action={action} onMouseDown={(event) => event.preventDefault()} />
            ))}
            <MarkdownEditorLink />
            <MarkdownEditorImage />
            <ToolbarSeparator />
            <MarkdownEditorHistoryButton
              label={labels.undo}
              Icon={UndoIcon}
              disabled={!editable || !history?.undo}
              onClick={() => editor?.chain().focus().undo().run()}
            />
            <MarkdownEditorHistoryButton
              label={labels.redo}
              Icon={RedoIcon}
              disabled={!editable || !history?.redo}
              onClick={() => editor?.chain().focus().redo().run()}
            />
            <ToolbarButton
              type="button"
              aria-pressed={source}
              disabled={disabled || !editor || sourceRequired || uploads.length > 0}
              onClick={() => setSource(!source)}
            >
              {labels.source}
            </ToolbarButton>
            {children}
          </Toolbar>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

export function MarkdownEditorHeading() {
  const { editor, editable, labels } = useMarkdownEditor();
  const level = useEditorState({
    editor,
    selector: ({ editor: activeEditor }) =>
      activeEditor?.isActive("heading") ? String(activeEditor.getAttributes("heading").level) : "paragraph",
  });
  const current = level && level !== "paragraph" ? labels.headingShort(Number(level)) : labels.text;
  return (
    <DropdownMenu>
      <ToolbarButton type="button" aria-label={labels.textStyle(current)} disabled={!editable} render={<DropdownMenuTrigger />}>
        <span>{current}</span>
        <ChevronDownIcon aria-hidden="true" />
      </ToolbarButton>
      <DropdownMenuContent finalFocus={() => editor?.view.dom ?? true}>
        <DropdownMenuRadioGroup
          value={level ?? "paragraph"}
          onValueChange={(value) => {
            if (!editor || !editable) return;
            const heading = ([1, 2, 3, 4, 5, 6] as const).find((item) => String(item) === value);
            if (heading) editor.chain().focus().setHeading({ level: heading }).run();
            else editor.chain().focus().setParagraph().run();
          }}
        >
          <DropdownMenuRadioItem value="paragraph" closeOnClick>
            {labels.paragraph}
          </DropdownMenuRadioItem>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <DropdownMenuRadioItem key={item} value={String(item)} closeOnClick>
              {labels.heading(item)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MarkdownEditorUrlField({
  label,
  error,
  invalid,
  ...props
}: Omit<ComponentProps<typeof Input>, "id"> & { label: string; error: string; invalid: boolean }) {
  const inputId = useId();
  const errorId = useId();
  return (
    <>
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} aria-invalid={invalid || undefined} aria-describedby={invalid ? errorId : undefined} {...props} />
      {invalid ? (
        <Text as="p" id={errorId} role="alert" size="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </>
  );
}

export function MarkdownEditorLink() {
  const { editor, editable, labels, isUrlAllowed } = useMarkdownEditor();
  const linked = useEditorState({ editor, selector: ({ editor: current }) => Boolean(current?.isActive("link")) });
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [checked, setChecked] = useState(false);
  const href = url.trim();
  const valid = isUrlAllowed(href, "link");
  function apply() {
    if (!valid || !editable) return;
    editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setOpen(false);
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) return;
        setUrl(editor?.getAttributes("link").href ?? "");
        setChecked(false);
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={<ToolbarButton type="button" iconOnly aria-label={labels.link} disabled={!editable} render={<PopoverTrigger />} />}
        >
          <LinkIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{labels.link}</TooltipContent>
      </Tooltip>
      <PopoverContent
        finalFocus={() => editor?.view.dom ?? true}
        className="grid gap-3"
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.target instanceof HTMLInputElement && !event.nativeEvent.isComposing) {
            event.preventDefault();
            event.stopPropagation();
            setChecked(true);
            apply();
          }
        }}
      >
        <PopoverTitle>{labels.link}</PopoverTitle>
        <MarkdownEditorUrlField
          label={labels.linkUrl}
          error={labels.linkInvalid}
          invalid={checked && href !== "" && !valid}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onBlur={() => setChecked(true)}
          placeholder="https://example.com"
        />
        <div className="flex gap-2">
          <Button type="button" disabled={!valid || !editable} onClick={apply}>
            {labels.applyLink}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!editable || !linked}
            onClick={() => {
              editor?.chain().focus().extendMarkRange("link").unsetLink().run();
              setOpen(false);
            }}
          >
            {labels.removeLink}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function MarkdownEditorImage() {
  const { editor, editable, labels, canUpload, upload, isUrlAllowed } = useMarkdownEditor();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [checked, setChecked] = useState(false);
  const altId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const src = url.trim();
  const valid = isUrlAllowed(src, "image");
  function insert() {
    if (!valid || !editable) return;
    editor?.chain().focus().setImage({ src, alt }).run();
    setOpen(false);
    setUrl("");
    setAlt("");
    setChecked(false);
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={<ToolbarButton type="button" iconOnly aria-label={labels.image} disabled={!editable} render={<PopoverTrigger />} />}
        >
          <ImageIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{labels.image}</TooltipContent>
      </Tooltip>
      <PopoverContent
        finalFocus={() => editor?.view.dom ?? true}
        className="grid gap-3"
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.target instanceof HTMLInputElement && !event.nativeEvent.isComposing) {
            event.preventDefault();
            event.stopPropagation();
            setChecked(true);
            insert();
          }
        }}
      >
        <PopoverTitle>{labels.image}</PopoverTitle>
        <MarkdownEditorUrlField
          label={labels.imageUrl}
          error={labels.imageInvalid}
          invalid={checked && src !== "" && !valid}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onBlur={() => setChecked(true)}
          placeholder="https://example.com/image.png"
        />
        <Label htmlFor={altId}>{labels.imageDescription}</Label>
        <Input id={altId} value={alt} onChange={(event) => setAlt(event.target.value)} />
        <Button type="button" disabled={!valid || !editable} onClick={insert}>
          {labels.image}
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
            <Button type="button" variant="ghost" disabled={!editable} onClick={() => fileInput.current?.click()}>
              {labels.uploadImages}
            </Button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function MarkdownEditorUploads() {
  const { uploads, uploadError, retryUpload, removeUpload, disabled, labels } = useMarkdownEditor();
  return (
    <>
      {uploadError ? (
        <Text as="p" role="alert">
          {uploadError}
        </Text>
      ) : null}
      {uploads.length > 0 ? (
        <div data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="uploads">
          <ChatComposerAttachments label={labels.uploads}>
            {uploads.map((item) => (
              <ChatComposerAttachment
                key={item.id}
                file={item.file}
                status={item.status}
                progress={item.progress}
                onRemove={disabled ? undefined : () => removeUpload(item.id)}
                removeLabel={labels.removeUpload(item.file.name)}
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
                  {labels.retryUpload}
                </Button>
              </div>
            ))}
        </div>
      ) : null}
    </>
  );
}
