"use client";

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
import type { SkinIconComponent, SkinIconName } from "@/components/control-ui/skin";
import { useSkinIcon } from "@/components/control-ui/skin-provider";
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
import { useMarkdownEditor, useMarkdownEditorSnapshot } from "./context";
import { markdownHeadingLevels } from "./engine";
import { markdownImageTypes } from "./uploads";

type MarkdownEditorFormatAction = {
  label: string;
  icon: SkinIconName;
  fallbackIcon: SkinIconComponent;
  active: boolean;
  disabled?: boolean;
  run: () => void;
};

export function useMarkdownEditorFormatActions() {
  const { engine, labels } = useMarkdownEditor();
  const { marks: mark, blocks: block, inlineOnly } = useMarkdownEditorSnapshot();
  const marks: MarkdownEditorFormatAction[] = [
    { label: labels.bold, icon: "bold", fallbackIcon: BoldIcon, active: mark.bold, run: () => engine?.toggleMark("bold") },
    { label: labels.italic, icon: "italic", fallbackIcon: ItalicIcon, active: mark.italic, run: () => engine?.toggleMark("italic") },
    {
      label: labels.strikethrough,
      icon: "strikethrough",
      fallbackIcon: StrikethroughIcon,
      active: mark.strike,
      run: () => engine?.toggleMark("strike"),
    },
    { label: labels.inlineCode, icon: "code", fallbackIcon: CodeIcon, active: mark.code, run: () => engine?.toggleMark("code") },
  ];
  const blockAction = (
    label: string,
    icon: SkinIconName,
    fallbackIcon: SkinIconComponent,
    type: keyof typeof block,
  ): MarkdownEditorFormatAction => ({
    label,
    icon,
    fallbackIcon,
    active: block[type],
    disabled: inlineOnly,
    run: () => engine?.toggleBlock(type),
  });
  const blocks = [
    blockAction(labels.bulletList, "bulletList", ListIcon, "bulletList"),
    blockAction(labels.orderedList, "orderedList", ListOrderedIcon, "orderedList"),
    blockAction(labels.taskList, "taskList", ListChecksIcon, "taskList"),
    blockAction(labels.quote, "quote", QuoteIcon, "blockquote"),
    blockAction(labels.codeBlock, "codeBlock", SquareCodeIcon, "codeBlock"),
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
  const { label, icon, fallbackIcon, active, disabled, run } = action;
  const ActionGlyph = useSkinIcon(icon, fallbackIcon);
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToolbarButton
            type="button"
            iconOnly
            aria-label={label}
            aria-pressed={active}
            disabled={!editable || disabled}
            onMouseDown={onMouseDown}
            onClick={run}
          />
        }
      >
        <ActionGlyph aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function MarkdownEditorHistoryButton({
  label,
  icon,
  fallbackIcon,
  disabled,
  onClick,
}: {
  label: string;
  icon: SkinIconName;
  fallbackIcon: SkinIconComponent;
  disabled: boolean;
  onClick: () => void;
}) {
  const HistoryGlyph = useSkinIcon(icon, fallbackIcon);
  return (
    <Tooltip>
      <TooltipTrigger render={<ToolbarButton type="button" iconOnly aria-label={label} disabled={disabled} onClick={onClick} />}>
        <HistoryGlyph aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function MarkdownEditorToolbar({ children }: { children?: ReactNode }) {
  const { engine, disabled, editable, labels, source, sourceRequired, setSource, uploads } = useMarkdownEditor();
  const { marks, blocks } = useMarkdownEditorFormatActions();
  const { canUndo, canRedo } = useMarkdownEditorSnapshot();
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
              icon="undo"
              fallbackIcon={UndoIcon}
              disabled={!editable || !canUndo}
              onClick={() => engine?.undo()}
            />
            <MarkdownEditorHistoryButton
              label={labels.redo}
              icon="redo"
              fallbackIcon={RedoIcon}
              disabled={!editable || !canRedo}
              onClick={() => engine?.redo()}
            />
            <ToolbarButton
              type="button"
              aria-pressed={source}
              disabled={disabled || !engine || sourceRequired || uploads.length > 0}
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
  const ChevronDownGlyph = useSkinIcon("chevronDown", ChevronDownIcon);
  const { engine, editable, labels } = useMarkdownEditor();
  const { heading, inlineOnly } = useMarkdownEditorSnapshot();
  const current = heading ? labels.headingShort(heading) : labels.text;
  return (
    <DropdownMenu>
      <ToolbarButton
        type="button"
        aria-label={labels.textStyle(current)}
        disabled={!editable || inlineOnly}
        render={<DropdownMenuTrigger />}
      >
        <span>{current}</span>
        <ChevronDownGlyph aria-hidden="true" />
      </ToolbarButton>
      <DropdownMenuContent finalFocus={() => engine?.element ?? true}>
        <DropdownMenuRadioGroup
          value={heading ? String(heading) : "paragraph"}
          onValueChange={(value) => {
            if (editable) engine?.setHeading(markdownHeadingLevels.find((level) => String(level) === value) ?? null);
          }}
        >
          <DropdownMenuRadioItem value="paragraph" closeOnClick>
            {labels.paragraph}
          </DropdownMenuRadioItem>
          {markdownHeadingLevels.map((item) => (
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
  const LinkGlyph = useSkinIcon("link", LinkIcon);
  const { engine, editable, labels, isUrlAllowed } = useMarkdownEditor();
  const { link } = useMarkdownEditorSnapshot();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [checked, setChecked] = useState(false);
  const href = url.trim();
  const valid = isUrlAllowed(href, "link");
  function apply() {
    if (!valid || !editable) return;
    engine?.setLink(href);
    setOpen(false);
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) return;
        setUrl(engine?.getSnapshot().link ?? "");
        setChecked(false);
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={<ToolbarButton type="button" iconOnly aria-label={labels.link} disabled={!editable} render={<PopoverTrigger />} />}
        >
          <LinkGlyph aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{labels.link}</TooltipContent>
      </Tooltip>
      <PopoverContent
        finalFocus={() => engine?.element ?? true}
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
            disabled={!editable || !link}
            onClick={() => {
              engine?.setLink(null);
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
  const ImageGlyph = useSkinIcon("image", ImageIcon);
  const { engine, editable, labels, canUpload, upload, isUrlAllowed } = useMarkdownEditor();
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
    engine?.insertImage({ src, alt });
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
          <ImageGlyph aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{labels.image}</TooltipContent>
      </Tooltip>
      <PopoverContent
        finalFocus={() => engine?.element ?? true}
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
