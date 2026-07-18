"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Children, createContext, isValidElement, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { CodeChrome, CodeDensity, CodeHighlight, CodeOverflow } from "@/components/control-ui/contracts";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { cn } from "@/components/control-ui/lib/cn";
import { type CodeTokenLines, highlightToTokens } from "@/components/control-ui/lib/code-tokens";
import { skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

/* Shared low-level code surface: gutter + code grid, token-colored via lib/code-tokens (Shiki CSS-vars,
 * follows skin), clean-copy structure (line numbers in select-none cells), optional TanStack virtualization.
 * CodeDiff and markdown fence renderer build on this same token renderer + row shape. */

// Above this line count, Code virtualizes rows even without an explicit `virtualize` prop.
const VIRTUALIZE_THRESHOLD = 200;
// Row height estimate for the virtualizer (measured precisely after paint via measureElement).
const ESTIMATED_LINE_HEIGHT = 20;

type CodeContextValue = { chrome: CodeChrome; density: CodeDensity; overflow: CodeOverflow; hasHeader: boolean };

const CodeContext = createContext<CodeContextValue | null>(null);

function useCodeContext(): CodeContextValue {
  const context = useContext(CodeContext);
  if (!context) throw new Error("Code compound parts must be rendered inside <Code>.");
  return context;
}

export type CodeProps = ComponentProps<"figure"> & {
  overflow?: CodeOverflow;
  chrome?: CodeChrome;
  density?: CodeDensity;
};

function hasCodeHeader(children: ReactNode) {
  return Children.toArray(children).some((child) => isValidElement(child) && child.type === CodeHeader);
}

export function Code({ overflow = "scroll", chrome = "standalone", density = "default", className, children, ...props }: CodeProps) {
  const isEmbedded = chrome === "embedded";
  const hasHeader = hasCodeHeader(children);

  return (
    <CodeContext.Provider value={{ chrome, density, overflow, hasHeader }}>
      <figure
        data-control-ui="code"
        data-slot="root"
        data-surface="panel"
        data-chrome={chrome}
        data-density={density}
        data-header={hasHeader ? "true" : undefined}
        className={cn(
          "min-w-0 [--nest-gap:0.5rem]",
          !hasHeader && "relative",
          isEmbedded
            ? "my-0 overflow-hidden rounded-none border-0 bg-transparent shadow-none ring-0"
            : "my-4 overflow-hidden rounded-panel bg-muted shadow-sm ring-1 ring-inset ring-border",
          skinSlot("code", "root", { chrome, density }),
          className,
        )}
        {...props}
      >
        {children}
      </figure>
    </CodeContext.Provider>
  );
}

export type CodeHeaderProps = ComponentProps<"figcaption">;

export function CodeHeader({ className, ...props }: CodeHeaderProps) {
  return (
    <figcaption
      data-control-ui="code"
      data-slot="header"
      className={cn("flex min-h-10 items-center justify-between gap-3 border-b px-3 py-1.5", skinSlot("code", "header", {}), className)}
      {...props}
    />
  );
}

export type CodeTitleProps = ComponentProps<"span">;

export function CodeTitle({ className, ...props }: CodeTitleProps) {
  return (
    <span
      data-control-ui="code"
      data-slot="title"
      className={cn("block min-w-0 truncate font-mono text-label text-muted-foreground", skinSlot("code", "title", {}), className)}
      {...props}
    />
  );
}

export type CodeActionsProps = ComponentProps<"div">;

export function CodeActions({ className, ...props }: CodeActionsProps) {
  return (
    <div
      data-control-ui="code"
      data-slot="actions"
      className={cn("flex shrink-0 items-center gap-1", skinSlot("code", "actions", {}), className)}
      {...props}
    />
  );
}

export type CodeCopyProps = Omit<ComponentProps<typeof Button>, "children" | "onClick"> & {
  value: string;
  children?: ReactNode;
  copiedLabel?: ReactNode;
  copiedAriaLabel?: string;
};

// Copy control IS the library Button (quiet variant), so it stays in lockstep with every other control, no bespoke styling.
export function CodeCopy({
  value,
  copiedLabel = "Copied",
  copiedAriaLabel = "Copied",
  children = "Copy",
  "aria-label": ariaLabel,
  ...props
}: CodeCopyProps) {
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

export type CodeFloatingCopyProps = Omit<CodeCopyProps, "children" | "copiedLabel">;

export function CodeFloatingCopy({ className, "aria-label": ariaLabel = "Copy code", ...props }: CodeFloatingCopyProps) {
  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <CodeCopy
            aria-label={ariaLabel}
            className={cn(
              "absolute top-2 right-2 z-10 size-7 bg-background/85 p-0 shadow-sm ring-1 ring-inset ring-border backdrop-blur",
              className,
            )}
            copiedLabel={<CheckIcon aria-hidden="true" className="size-3.5" />}
            {...props}
          >
            <CopyIcon aria-hidden="true" className="size-3.5" />
          </CodeCopy>
        </TooltipTrigger>
        <TooltipContent side="left">{ariaLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Client-side highlighting: when `tokens` unset, tokenize in a cancellable effect keyed by lang+code.
 *  Returns null until resolved, or when highlighting off / language unknown — callers fall back to plain text. */
export function useCodeTokens({
  code,
  lang,
  tokens,
  highlight,
}: {
  code: string;
  lang?: string;
  tokens?: CodeTokenLines | null;
  highlight: CodeHighlight;
}): CodeTokenLines | null {
  const requestKey = `${lang ?? ""}\n${code}`;
  const [clientTokens, setClientTokens] = useState<{ key: string; tokens: CodeTokenLines | null } | null>(null);

  useEffect(() => {
    if (highlight === "none" || tokens !== undefined || !lang) return;
    let cancelled = false;
    void highlightToTokens(code, lang)
      .then((result) => {
        if (!cancelled) setClientTokens({ key: requestKey, tokens: result });
      })
      .catch(() => {
        if (!cancelled) setClientTokens({ key: requestKey, tokens: null });
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang, tokens, highlight, requestKey]);

  if (highlight === "none") return null;
  if (tokens !== undefined) return tokens;
  return clientTokens?.key === requestKey ? clientTokens.tokens : null;
}

/** Renders one line's Shiki tokens as colored spans. Shared by Code and CodeDiff. */
export function CodeTokenLine({ tokens, plain }: { tokens: CodeTokenLines[number] | null; plain: string }): ReactNode {
  if (!tokens || tokens.length === 0) return plain;
  return tokens.map((token, index) => {
    const style: CSSProperties = { ...token.style };
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: token order is the identity within a line
      <span key={index} style={style}>
        {token.content}
      </span>
    );
  });
}

// Select-none gutter + code cell, kept flat so text selection over the code column copies clean source.
function CodeRow({
  index,
  number,
  tokens,
  plain,
  overflow,
  showLineNumbers,
  measureRef,
  style,
}: {
  index?: number;
  number: number;
  tokens: CodeTokenLines[number] | null;
  plain: string;
  overflow: CodeOverflow;
  showLineNumbers: boolean;
  measureRef?: (node: HTMLDivElement | null) => void;
  style?: CSSProperties;
}) {
  return (
    <div
      ref={measureRef}
      data-index={index}
      data-control-ui="code"
      data-slot="line"
      className={cn("flex min-h-5 w-full", skinSlot("code", "line", {}))}
      style={style}
    >
      {showLineNumbers ? (
        <span
          data-control-ui="code"
          data-slot="gutter"
          aria-hidden="true"
          className={cn("shrink-0 select-none pr-3 pl-4 text-right tabular-nums text-muted-foreground/60", skinSlot("code", "gutter", {}))}
          style={{ minWidth: "3.5rem" }}
        >
          {number}
        </span>
      ) : null}
      <code
        className={cn(
          "min-w-0 flex-1 pr-4",
          overflow === "wrap" ? "whitespace-pre-wrap break-words" : "whitespace-pre",
          !showLineNumbers && "pl-4",
        )}
      >
        <CodeTokenLine tokens={tokens} plain={plain} />
      </code>
    </div>
  );
}

export type CodeContentProps = Omit<ComponentProps<"div">, "children"> & {
  code: string;
  lang?: string;
  tokens?: CodeTokenLines | null;
  highlight?: CodeHighlight;
  showLineNumbers?: boolean;
  startLine?: number;
  maxHeight?: string;
  virtualize?: boolean;
};

export function CodeContent({
  code,
  lang,
  tokens,
  highlight = "auto",
  showLineNumbers = false,
  startLine = 1,
  maxHeight = "32rem",
  virtualize,
  className,
  ref,
  style,
  ...props
}: CodeContentProps) {
  const { density, overflow, hasHeader } = useCodeContext();
  const resolvedTokens = useCodeTokens({ code, lang, tokens, highlight });
  const plainLines = useMemo(() => code.split("\n"), [code]);
  const isCompact = density === "compact";

  const scrollRef = useRef<HTMLDivElement>(null);
  function setScrollElement(node: HTMLDivElement | null) {
    scrollRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }
  const shouldVirtualize = virtualize ?? plainLines.length > VIRTUALIZE_THRESHOLD;
  const useScrollArea = density !== "compact" || overflow !== "wrap";

  // react-doctor-disable-next-line react-hooks-js/incompatible-library
  const virtualizer = useVirtualizer({
    count: plainLines.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_LINE_HEIGHT,
    overscan: 24,
    enabled: shouldVirtualize,
  });

  const gridClassName = cn(
    // The `color:` label keeps tailwind-merge from treating the arbitrary color utility as font size.
    "font-mono leading-5 text-[color:var(--code-foreground)]",
    isCompact ? "py-2 text-micro" : "py-3 text-label",
    overflow === "scroll" ? "w-max min-w-full" : "w-full",
  );

  const grid = shouldVirtualize ? (
    <>
      <pre data-control-ui="code" data-slot="accessible-source" className="sr-only">
        <code>{code}</code>
      </pre>
      <div aria-hidden="true" className={gridClassName} style={{ position: "relative", height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((item) => (
          <CodeRow
            key={item.key}
            index={item.index}
            number={startLine + item.index}
            tokens={resolvedTokens?.[item.index] ?? null}
            plain={plainLines[item.index] ?? ""}
            overflow={overflow}
            showLineNumbers={showLineNumbers}
            measureRef={virtualizer.measureElement}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${item.start}px)` }}
          />
        ))}
      </div>
    </>
  ) : (
    <div className={gridClassName}>
      {plainLines.map((plain, index) => (
        <CodeRow
          // biome-ignore lint/suspicious/noArrayIndexKey: line position is the row identity
          key={index}
          number={startLine + index}
          tokens={resolvedTokens?.[index] ?? null}
          plain={plain}
          overflow={overflow}
          showLineNumbers={showLineNumbers}
        />
      ))}
    </div>
  );

  const content = useScrollArea ? (
    <ScrollArea
      maxHeight={maxHeight}
      viewportClassName={cn(skinSlot("code", "content", {}), className)}
      viewportProps={{ ...props, "data-control-ui": "code", "data-slot": "content", style }}
      viewportRef={setScrollElement}
    >
      {grid}
    </ScrollArea>
  ) : (
    <div
      ref={setScrollElement}
      data-control-ui="code"
      data-slot="content"
      className={cn("overflow-auto", skinSlot("code", "content", {}), className)}
      style={{ ...style, maxHeight }}
      {...props}
    >
      {grid}
    </div>
  );

  if (hasHeader) return content;

  return (
    <div className="relative pt-10">
      <CodeFloatingCopy value={code} />
      {content}
    </div>
  );
}
