"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import { Children, createContext, Fragment, isValidElement, use, useEffect, useState } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { cn } from "@/components/control-ui/lib/cn";
import {
  type CodeBlockEditorTokenLines,
  type CodeBlockEditorTokenStyle,
  highlightCodeToTokens,
} from "@/components/control-ui/lib/code-block-shiki";
import { Button } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

export type CodeBlockEditorOverflow = "wrap" | "scroll";
export type CodeBlockEditorHighlight = "auto" | "none";
export type CodeBlockEditorChrome = "standalone" | "embedded";
export type CodeBlockEditorDensity = "default" | "compact";
export type CodeBlockEditorVariant = "default" | "command";

type CodeBlockEditorContextValue = {
  overflow: CodeBlockEditorOverflow;
  chrome: CodeBlockEditorChrome;
  density: CodeBlockEditorDensity;
  variant: CodeBlockEditorVariant;
  hasHeader: boolean;
};

const CodeBlockEditorContext = createContext<CodeBlockEditorContextValue | null>(null);

function useCodeBlockEditorContext() {
  const context = use(CodeBlockEditorContext);
  if (!context) throw new Error("CodeBlockEditor compound parts must be rendered inside <CodeBlockEditor>.");
  return context;
}

function resolveCodeBlockEditorClasses({ overflow, chrome, density, variant }: CodeBlockEditorContextValue) {
  const isEmbedded = chrome === "embedded";
  const isCommand = variant === "command";
  const isCompact = density === "compact" || isCommand;
  const scrollOverflowClassName = isCommand ? "w-full max-w-full overflow-x-auto whitespace-pre" : "w-max min-w-full whitespace-pre";

  return {
    codeClassName: cn(
      "font-mono leading-5 text-[color:var(--code-foreground)]",
      isCompact ? "min-h-0 px-3 py-2 text-label" : "min-h-[160px] p-4 text-label",
      isEmbedded ? "bg-transparent" : "bg-muted",
      overflow === "scroll" ? scrollOverflowClassName : "w-full whitespace-pre-wrap break-words",
    ),
    editorClassName: cn(
      "w-full max-w-full overflow-auto font-mono leading-5 text-[color:var(--code-foreground)]",
      isCompact ? "max-h-[320px] min-h-0 px-3 py-2 text-label" : "max-h-[520px] min-h-[160px] p-4 text-label",
      isEmbedded ? "bg-transparent" : "bg-muted",
      overflow === "scroll" ? "whitespace-pre" : "whitespace-pre-wrap break-words",
    ),
    scrollAreaClassName: cn(isEmbedded ? "bg-transparent" : "bg-muted"),
    scrollable: !isCommand,
    maxHeight: isCompact ? "320px" : "520px",
  };
}

export type CodeBlockEditorProps = ComponentProps<"figure"> & {
  overflow?: CodeBlockEditorOverflow;
  chrome?: CodeBlockEditorChrome;
  density?: CodeBlockEditorDensity;
  variant?: CodeBlockEditorVariant;
};

function hasCodeBlockEditorHeader(children: ReactNode) {
  return Children.toArray(children).some((child) => isValidElement(child) && child.type === CodeBlockEditorHeader);
}

export type CodeBlockEditorHeaderProps = ComponentProps<"figcaption">;
export type CodeBlockEditorTitleProps = ComponentProps<"span">;
export type CodeBlockEditorActionsProps = ComponentProps<"div">;

export type CodeBlockEditorCopyProps = Omit<ComponentProps<typeof Button>, "children" | "onClick"> & {
  value: string;
  children?: ReactNode;
  copiedLabel?: ReactNode;
  copiedAriaLabel?: string;
};

export type CodeBlockEditorContentProps = Omit<ComponentProps<"pre">, "children"> & {
  code: string;
  lang?: string;
  tokens?: CodeBlockEditorTokenLines | null;
  highlight?: CodeBlockEditorHighlight;
  maxHeight?: string;
  scrollAreaClassName?: string;
};

export type CodeBlockEditorTextareaProps = Omit<ComponentProps<"textarea">, "defaultValue" | "value"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  fileName?: string;
};

function createKeyedTokenLines(lines: CodeBlockEditorTokenLines) {
  return lines.reduce<{
    offset: number;
    lines: { key: number; tokens: { key: number; content: string; style?: CodeBlockEditorTokenStyle }[] }[];
  }>(
    (state, line) => {
      const tokenState = line.reduce<{ offset: number; tokens: { key: number; content: string; style?: CodeBlockEditorTokenStyle }[] }>(
        (tokenAccumulator, token) => ({
          offset: tokenAccumulator.offset + token.content.length,
          tokens: [
            ...tokenAccumulator.tokens,
            {
              key: tokenAccumulator.offset,
              content: token.content,
              style: token.style,
            },
          ],
        }),
        { offset: state.offset, tokens: [] },
      );

      return {
        offset: tokenState.offset + 1,
        lines: [
          ...state.lines,
          {
            key: state.offset,
            tokens: tokenState.tokens,
          },
        ],
      };
    },
    { offset: 0, lines: [] },
  ).lines;
}

function useHighlightedTokens({
  code,
  lang,
  tokens,
  highlight,
}: {
  code: string;
  lang?: string;
  tokens?: CodeBlockEditorTokenLines | null;
  highlight: CodeBlockEditorHighlight;
}) {
  const tokenKey = `${lang ?? ""}\n${code}`;
  const [clientTokens, setClientTokens] = useState<{ key: string; tokens: CodeBlockEditorTokenLines | null } | null>(null);

  useEffect(() => {
    if (highlight === "none" || tokens !== undefined || !lang) return;

    let cancelled = false;
    const requestKey = `${lang}\n${code}`;

    void highlightCodeToTokens(code, lang)
      .then((result) => {
        if (!cancelled) setClientTokens({ key: requestKey, tokens: result });
      })
      .catch(() => {
        if (!cancelled) setClientTokens({ key: requestKey, tokens: null });
      });

    return () => {
      cancelled = true;
    };
  }, [code, lang, tokens, highlight]);

  if (highlight === "none") return null;
  return tokens ?? (clientTokens?.key === tokenKey ? clientTokens.tokens : null);
}

function CodeBlockEditorCode({
  code,
  lang,
  tokens,
  highlight,
  maxHeight,
  scrollAreaClassName,
  scrollable,
  className,
  ...props
}: ComponentProps<"pre"> & {
  code: string;
  lang?: string;
  tokens?: CodeBlockEditorTokenLines | null;
  highlight: CodeBlockEditorHighlight;
  maxHeight: string;
  scrollAreaClassName: string;
  scrollable: boolean;
}) {
  const highlightedTokens = useHighlightedTokens({ code, lang, tokens, highlight });

  const codeNode =
    highlightedTokens === null || highlightedTokens.length === 0 ? (
      <code>{code}</code>
    ) : (
      <code>
        {createKeyedTokenLines(highlightedTokens).map((line, lineIndex, keyedLines) => (
          <Fragment key={line.key}>
            <span>
              {line.tokens.map((token) => (
                // Color arrives as var(--code-token-*) from shared CSS-variables theme; follows active skin, no dual light/dark className needed.
                <span key={token.key} style={token.style}>
                  {token.content}
                </span>
              ))}
            </span>
            {lineIndex !== keyedLines.length - 1 ? "\n" : null}
          </Fragment>
        ))}
      </code>
    );

  const block = (
    <pre className={className} {...props}>
      {codeNode}
    </pre>
  );

  if (!scrollable) return block;

  return (
    <ScrollArea className={scrollAreaClassName} maxHeight={maxHeight}>
      {block}
    </ScrollArea>
  );
}

export function CodeBlockEditor({
  overflow,
  chrome = "standalone",
  density = "default",
  variant = "default",
  className,
  children,
  ...props
}: CodeBlockEditorProps) {
  const isEmbedded = chrome === "embedded";
  const resolvedOverflow = overflow ?? (variant === "command" ? "wrap" : "scroll");
  const hasHeader = hasCodeBlockEditorHeader(children);

  return (
    <CodeBlockEditorContext.Provider value={{ overflow: resolvedOverflow, chrome, density, variant, hasHeader }}>
      <figure
        data-control-ui="code-block-editor"
        data-slot="root"
        data-surface="panel"
        data-variant={variant}
        data-header={hasHeader ? "true" : undefined}
        className={cn(
          "min-w-0 [--nest-gap:0.5rem]",
          !hasHeader && "relative",
          isEmbedded
            ? "my-0 overflow-hidden rounded-none border-0 bg-transparent shadow-none ring-0 [--nest-radius:0px]"
            : "my-4 overflow-hidden rounded-[var(--nest-radius)] bg-muted shadow-sm ring-1 ring-inset ring-border [--nest-radius:min(var(--radius-panel),calc(var(--nest-gap)*var(--nest-corner-ratio)))]",
          className,
        )}
        {...props}
      >
        {children}
      </figure>
    </CodeBlockEditorContext.Provider>
  );
}

export function CodeBlockEditorHeader({ className, ...props }: CodeBlockEditorHeaderProps) {
  return (
    <figcaption
      data-control-ui="code-block-editor"
      data-slot="header"
      className={cn("flex min-h-11 items-center justify-between gap-3 border-b px-3 py-2", className)}
      {...props}
    />
  );
}

export function CodeBlockEditorTitle({ className, ...props }: CodeBlockEditorTitleProps) {
  return (
    <span
      data-control-ui="code-block-editor"
      data-slot="title"
      className={cn("block min-w-0 truncate font-mono text-label text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CodeBlockEditorActions({ className, ...props }: CodeBlockEditorActionsProps) {
  return (
    <div data-control-ui="code-block-editor" data-slot="actions" className={cn("flex shrink-0 items-center gap-1", className)} {...props} />
  );
}

export function CodeBlockEditorCopy({
  value,
  copiedLabel = "Copied",
  copiedAriaLabel = "Copied",
  children = "Copy",
  "aria-label": ariaLabel,
  ...props
}: CodeBlockEditorCopyProps) {
  const { isCopied, handleCopy } = useCopyToClipboard({ text: value });

  return (
    <Button
      type="button"
      variant="quiet"
      size="xs"
      aria-live="polite"
      aria-label={isCopied && ariaLabel ? copiedAriaLabel : ariaLabel}
      {...props}
      onClick={handleCopy}
    >
      {isCopied ? copiedLabel : children}
    </Button>
  );
}

export type CodeBlockEditorFloatingCopyProps = Omit<CodeBlockEditorCopyProps, "children" | "copiedLabel">;

export function CodeBlockEditorFloatingCopy({
  className,
  "aria-label": ariaLabel = "Copy code",
  ...props
}: CodeBlockEditorFloatingCopyProps) {
  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <CodeBlockEditorCopy
            aria-label={ariaLabel}
            className={cn(
              "absolute top-2 right-2 z-10 size-7 bg-background/85 p-0 shadow-sm ring-1 ring-inset ring-border backdrop-blur",
              className,
            )}
            copiedLabel={<CheckIcon aria-hidden="true" className="size-3.5" />}
            {...props}
          >
            <CopyIcon aria-hidden="true" className="size-3.5" />
          </CodeBlockEditorCopy>
        </TooltipTrigger>
        <TooltipContent side="left">{ariaLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function CodeBlockEditorContent({
  code,
  lang,
  tokens,
  highlight = "auto",
  maxHeight,
  scrollAreaClassName,
  className,
  ...props
}: CodeBlockEditorContentProps) {
  const context = useCodeBlockEditorContext();
  const classes = resolveCodeBlockEditorClasses(context);

  const content = (
    <CodeBlockEditorCode
      code={code}
      lang={lang}
      tokens={tokens}
      highlight={highlight}
      maxHeight={maxHeight ?? classes.maxHeight}
      scrollAreaClassName={cn(classes.scrollAreaClassName, scrollAreaClassName)}
      scrollable={classes.scrollable}
      className={cn(classes.codeClassName, className)}
      {...props}
    />
  );

  if (context.hasHeader) return content;

  return (
    <div className="relative pt-10">
      <CodeBlockEditorFloatingCopy value={code} />
      {content}
    </div>
  );
}

export function CodeBlockEditorTextarea({
  value,
  defaultValue = "",
  onValueChange,
  onChange,
  fileName,
  className,
  "aria-label": ariaLabel,
  ...props
}: CodeBlockEditorTextareaProps) {
  const { editorClassName } = resolveCodeBlockEditorClasses(useCodeBlockEditorContext());
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextValue = event.target.value;
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    onChange?.(event);
  }

  return (
    <textarea
      value={currentValue}
      onChange={handleChange}
      aria-label={ariaLabel ?? (fileName ? `${fileName} code` : "Code editor")}
      spellCheck={false}
      className={cn(editorClassName, "block resize-y border-0 outline-none", className)}
      {...props}
    />
  );
}
