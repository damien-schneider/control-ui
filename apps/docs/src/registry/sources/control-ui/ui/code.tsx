"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ChangeEvent, ComponentProps, CSSProperties, ReactNode } from "react";
import { Children, createContext, isValidElement, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import type { CodeKnobStyle } from "@/components/control-ui/knob-contracts/code-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { type CodeTokenLines, highlightToTokens } from "@/components/control-ui/lib/code-tokens";
import { Button } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

export type CodeOverflow = "wrap" | "scroll";

export type CodeHighlight = "auto" | "none";

export type CodeDensity = "default" | "compact";

export type CodeChrome = "standalone" | "embedded";

const MAX_STATIC_CODE_LINES = 1000;
const ESTIMATED_LINE_HEIGHT = 20;

type CodeContextValue = { chrome: CodeChrome; density: CodeDensity; overflow: CodeOverflow; hasHeader: boolean; copy: boolean };

const CodeContext = createContext<CodeContextValue | null>(null);

function useCodeContext(): CodeContextValue {
  const context = useContext(CodeContext);
  if (!context) throw new Error("Code compound parts must be rendered inside <Code>.");
  return context;
}

export type CodeProps = Omit<ComponentProps<"figure">, "style"> & {
  overflow?: CodeOverflow;
  chrome?: CodeChrome;
  density?: CodeDensity;
  /** A headerless surface overlays its own copy button; turn it off to place one yourself. */
  copy?: boolean;
  style?: CSSProperties & CodeKnobStyle;
};

function hasCodeHeader(children: ReactNode) {
  return Children.toArray(children).some((child) => isValidElement(child) && child.type === CodeHeader);
}

export function Code({
  overflow = "scroll",
  chrome = "standalone",
  density = "default",
  copy = true,
  className,
  children,
  ...props
}: CodeProps) {
  const hasHeader = hasCodeHeader(children);

  return (
    <CodeContext.Provider value={{ chrome, density, overflow, hasHeader, copy }}>
      <figure
        data-control-ui="code"
        data-control-family="code"
        data-slot="root"
        data-surface="panel"
        data-chrome={chrome}
        data-density={density}
        data-header={hasHeader ? "true" : undefined}
        className={cn("min-w-0 overflow-hidden", !hasHeader && "relative", className)}
        {...props}
      >
        {children}
      </figure>
    </CodeContext.Provider>
  );
}

export type CodeHeaderProps = Omit<ComponentProps<"figcaption">, "style"> & { style?: CSSProperties & CodeKnobStyle };

export function CodeHeader({ className, ...props }: CodeHeaderProps) {
  return (
    <figcaption
      data-control-ui="code"
      data-control-family="code"
      data-slot="header"
      className={cn("flex items-center justify-between", className)}
      {...props}
    />
  );
}

export type CodeTitleProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & CodeKnobStyle };

export function CodeTitle({ className, ...props }: CodeTitleProps) {
  return (
    <span
      data-control-ui="code"
      data-control-family="code"
      data-slot="title"
      className={cn("block min-w-0 truncate", className)}
      {...props}
    />
  );
}

export type CodeActionsProps = ComponentProps<"div"> & { style?: CSSProperties & CodeKnobStyle };

export function CodeActions({ className, ...props }: CodeActionsProps) {
  return (
    <div
      data-control-ui="code"
      data-control-family="code"
      data-slot="actions"
      className={cn("flex shrink-0 items-center", className)}
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

export function CodeCopy({
  value,
  copiedLabel,
  copiedAriaLabel = "Copied",
  children,
  className,
  "aria-label": ariaLabel,
  ...props
}: CodeCopyProps) {
  const { isCopied, handleCopy } = useCopyToClipboard({ text: value });
  const isIconOnly = children === undefined;
  const label = ariaLabel ?? (isIconOnly ? "Copy code" : undefined);
  const copied = copiedLabel ?? (isIconOnly ? <CheckIcon aria-hidden="true" className="size-3.5" /> : "Copied");

  const button = (
    <Button
      type="button"
      variant="quiet"
      size="xs"
      aria-live="polite"
      aria-label={label && isCopied ? copiedAriaLabel : label}
      data-code-copy={isIconOnly ? "true" : undefined}
      className={className}
      {...props}
      onClick={handleCopy}
    >
      {isCopied ? copied : (children ?? <CopyIcon aria-hidden="true" className="size-3.5" />)}
    </Button>
  );

  if (!isIconOnly) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}

export type CodeFloatingCopyProps = Omit<CodeCopyProps, "children" | "copiedLabel">;

export function CodeFloatingCopy({ className, ...props }: CodeFloatingCopyProps) {
  return <CodeCopy data-code-floating="true" className={cn("absolute top-2 right-2 z-10", className)} {...props} />;
}

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

function CodeRow({
  index,
  number,
  tokens,
  plain,
  overflow,
  showLineNumbers,
  highlighted,
  measureRef,
  style,
}: {
  index?: number;
  number: number;
  tokens: CodeTokenLines[number] | null;
  plain: string;
  overflow: CodeOverflow;
  showLineNumbers: boolean;
  highlighted: boolean;
  measureRef?: (node: HTMLDivElement | null) => void;
  style?: CSSProperties;
}) {
  return (
    <div
      ref={measureRef}
      data-index={index}
      data-control-ui="code"
      data-control-family="code"
      data-slot="line"
      data-highlighted={highlighted ? "true" : undefined}
      className="flex w-full"
      style={style}
    >
      {showLineNumbers ? (
        <span data-control-ui="code" data-control-family="code" data-slot="gutter" aria-hidden="true" className="shrink-0 select-none">
          {number}
        </span>
      ) : null}
      <code className={cn("min-w-0 flex-1", overflow === "wrap" ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
        <CodeTokenLine tokens={tokens} plain={plain} />
      </code>
    </div>
  );
}

export type CodeContentProps = Omit<ComponentProps<"div">, "children" | "style"> & {
  code: string;
  lang?: string;
  tokens?: CodeTokenLines | null;
  highlight?: CodeHighlight;
  showLineNumbers?: boolean;
  startLine?: number;
  highlightLines?: readonly number[];
  maxHeight?: string;
  virtualize?: boolean;
  style?: CSSProperties & CodeKnobStyle;
};

export function CodeContent({
  code,
  lang,
  tokens,
  highlight = "auto",
  showLineNumbers = false,
  startLine = 1,
  highlightLines,
  maxHeight = "32rem",
  virtualize,
  className,
  ref,
  style,
  ...props
}: CodeContentProps) {
  const { density, overflow, hasHeader, copy } = useCodeContext();
  const resolvedTokens = useCodeTokens({ code, lang, tokens, highlight });
  const plainLines = useMemo(() => code.split("\n"), [code]);
  const highlightedLineNumbers = new Set(highlightLines);
  const isCompact = density === "compact";

  const scrollRef = useRef<HTMLDivElement>(null);
  function setScrollElement(node: HTMLDivElement | null) {
    scrollRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }
  const shouldVirtualize = virtualize ?? plainLines.length > MAX_STATIC_CODE_LINES;
  const useScrollArea = density !== "compact" || overflow !== "wrap";

  // react-doctor-disable-next-line react-hooks-js/incompatible-library
  const virtualizer = useVirtualizer({
    count: plainLines.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_LINE_HEIGHT,
    overscan: 24,
    enabled: shouldVirtualize,
  });

  const gridClassName = overflow === "scroll" ? "w-max min-w-full" : "w-full";
  const textStyle = style;

  const grid = shouldVirtualize ? (
    <>
      <pre data-control-ui="code" data-control-family="code" data-slot="accessible-source" className="sr-only">
        <code>{code}</code>
      </pre>
      <div
        data-control-ui="code"
        data-control-family="code"
        data-slot="grid"
        data-density={isCompact ? "compact" : "default"}
        aria-hidden="true"
        className={gridClassName}
        style={{ ...textStyle, position: "relative", height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((item) => (
          <CodeRow
            key={item.key}
            index={item.index}
            number={startLine + item.index}
            tokens={resolvedTokens?.[item.index] ?? null}
            plain={plainLines[item.index] ?? ""}
            overflow={overflow}
            showLineNumbers={showLineNumbers}
            highlighted={highlightedLineNumbers.has(startLine + item.index)}
            measureRef={virtualizer.measureElement}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${item.start}px)` }}
          />
        ))}
      </div>
    </>
  ) : (
    <div
      data-control-ui="code"
      data-control-family="code"
      data-slot="grid"
      data-density={isCompact ? "compact" : "default"}
      className={gridClassName}
      style={textStyle}
    >
      {plainLines.map((plain, index) => (
        <CodeRow
          // biome-ignore lint/suspicious/noArrayIndexKey: line position is the row identity
          key={index}
          number={startLine + index}
          tokens={resolvedTokens?.[index] ?? null}
          plain={plain}
          overflow={overflow}
          showLineNumbers={showLineNumbers}
          highlighted={highlightedLineNumbers.has(startLine + index)}
        />
      ))}
    </div>
  );

  const content = useScrollArea ? (
    <ScrollArea
      maxHeight={maxHeight}
      viewportClassName={className}
      viewportProps={{
        ...props,
        "data-control-ui": "code",
        "data-control-family": "code",
        "data-slot": "content",
        style,
      }}
      viewportRef={setScrollElement}
    >
      {grid}
    </ScrollArea>
  ) : (
    <div
      ref={setScrollElement}
      data-control-ui="code"
      data-control-family="code"
      data-slot="content"
      className={cn("overflow-auto", className)}
      style={{ ...style, maxHeight }}
      {...props}
    >
      {grid}
    </div>
  );

  if (hasHeader || !copy) return content;

  return (
    <div data-control-ui="code" data-control-family="code" data-slot="floating-frame" className="relative">
      <CodeFloatingCopy value={code} />
      {content}
    </div>
  );
}

export type CodeEditableProps = Omit<ComponentProps<"textarea">, "defaultValue" | "value" | "style"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  fileName?: string;
  style?: CSSProperties & CodeKnobStyle;
};

export function CodeEditable({
  value,
  defaultValue = "",
  onValueChange,
  onChange,
  fileName,
  className,
  "aria-label": ariaLabel,
  ...props
}: CodeEditableProps) {
  const { overflow } = useCodeContext();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (value === undefined) setUncontrolledValue(event.target.value);
    onValueChange?.(event.target.value);
    onChange?.(event);
  }

  return (
    <textarea
      data-control-ui="code"
      data-control-family="code"
      data-slot="editor"
      value={currentValue}
      onChange={handleChange}
      aria-label={ariaLabel ?? (fileName ? `${fileName} code` : "Code editor")}
      spellCheck={false}
      className={cn(
        "block w-full max-w-full resize-y overflow-auto",
        overflow === "scroll" ? "whitespace-pre" : "whitespace-pre-wrap break-words",
        className,
      )}
      {...props}
    />
  );
}
