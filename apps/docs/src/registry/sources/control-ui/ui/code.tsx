"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ChangeEvent, ComponentProps, CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";
import { Children, createContext, isValidElement, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { type CopyStatus, useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import type { CodeKnobStyle } from "@/components/control-ui/knob-contracts/code-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { type CodeTokenLines, highlightToTokens } from "@/components/control-ui/lib/code-tokens";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Swap, SwapItem } from "@/components/control-ui/ui/swap";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

export type CodeOverflow = "wrap" | "scroll";

export type CodeHighlight = "auto" | "none";

export type CodeDensity = "default" | "compact";

export type CodeChrome = "standalone" | "embedded";

const MAX_STATIC_CODE_LINES = 1000;
const ESTIMATED_LINE_HEIGHT = 20;

type CodeContextValue = {
  chrome: CodeChrome;
  density: CodeDensity;
  overflow: CodeOverflow;
  hasHeader: boolean;
  copy: boolean;
  setRegisteredHeaders: Dispatch<SetStateAction<number>>;
};

type CodeGridStyle = CSSProperties & { "--_code-gutter-digits"?: number };

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
  const [registeredHeaders, setRegisteredHeaders] = useState(0);
  // the child scan settles the server render; registration finds a header wrapped in a fragment or a component
  const hasHeader = hasCodeHeader(children) || registeredHeaders > 0;

  return (
    <CodeContext.Provider value={{ chrome, density, overflow, hasHeader, copy, setRegisteredHeaders }}>
      <figure
        data-control-ui="code"
        data-control-family="code"
        data-slot="root"
        data-surface="panel"
        dir="ltr"
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
  const setRegisteredHeaders = useContext(CodeContext)?.setRegisteredHeaders;
  useLayoutEffect(() => {
    if (!setRegisteredHeaders) return;
    setRegisteredHeaders((count) => count + 1);
    return () => setRegisteredHeaders((count) => count - 1);
  }, [setRegisteredHeaders]);

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

export function CodeTitle({ className, children, ...props }: CodeTitleProps) {
  return (
    <span
      data-control-ui="code"
      data-control-family="code"
      data-slot="title"
      title={typeof children === "string" ? children : undefined}
      className={cn("block min-w-0 truncate", className)}
      {...props}
    >
      {children}
    </span>
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

export type CodeCopyProps = Omit<ComponentProps<typeof Button>, "children" | "onClick" | "onCopy"> & {
  value: string;
  children?: ReactNode;
  copiedLabel?: ReactNode;
  copiedAriaLabel?: string;
  copyFailedLabel?: string;
  onCopy?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
};

function copyStatusMessage(status: CopyStatus, copiedMessage: string, failedMessage: string) {
  if (status === "copied") return copiedMessage;
  if (status === "failed") return failedMessage;
  return "";
}

export function CodeCopy({
  value,
  copiedLabel,
  copiedAriaLabel = "Copied to clipboard",
  copyFailedLabel = "Couldn't copy. Select the text and copy it manually.",
  onCopy,
  onCopyError,
  children,
  className,
  "aria-label": ariaLabel,
  ...props
}: CodeCopyProps) {
  const { status, handleCopy } = useCopyToClipboard({ text: value, onCopy, onCopyError });
  const isIconOnly = children === undefined;
  const label = ariaLabel ?? (isIconOnly ? "Copy code" : undefined);
  const copied = copiedLabel ?? (isIconOnly ? <CheckIcon aria-hidden="true" /> : "Copied");
  const liveStatus = <LiveStatus message={copyStatusMessage(status, copiedAriaLabel, copyFailedLabel)} />;

  const button = (
    <Button
      type="button"
      variant="quiet"
      size="xs"
      aria-label={label}
      data-code-copy={isIconOnly ? "true" : undefined}
      className={className}
      {...props}
      onClick={handleCopy}
    >
      <Swap value={status === "copied" ? "copied" : "idle"}>
        <SwapItem value="idle">{children ?? <CopyIcon aria-hidden="true" />}</SwapItem>
        <SwapItem value="copied">{copied}</SwapItem>
      </Swap>
    </Button>
  );

  if (!isIconOnly) {
    return (
      <>
        {button}
        {liveStatus}
      </>
    );
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent side="inline-start">{copyStatusMessage(status, copiedAriaLabel, copyFailedLabel) || label}</TooltipContent>
      </Tooltip>
      {liveStatus}
    </>
  );
}

export type CodeFloatingCopyProps = Omit<CodeCopyProps, "children" | "copiedLabel">;

export function CodeFloatingCopy({ className, ...props }: CodeFloatingCopyProps) {
  return <CodeCopy variant="surface" data-code-floating="true" className={cn("absolute z-1", className)} {...props} />;
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
  const [clientTokens, setClientTokens] = useState<{ lang: string; tokens: CodeTokenLines | null } | null>(null);

  useEffect(() => {
    if (highlight === "none" || tokens !== undefined || !lang) return;
    let cancelled = false;
    const requested = lang;
    void highlightToTokens(code, requested)
      .then((result) => {
        if (!cancelled) setClientTokens({ lang: requested, tokens: result });
      })
      .catch(() => {
        if (!cancelled) setClientTokens({ lang: requested, tokens: null });
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang, tokens, highlight]);

  if (highlight === "none") return null;
  if (tokens !== undefined) return tokens;
  // while the next highlight resolves, the previous lines stay; rows drop any whose text has changed
  return clientTokens && clientTokens.lang === lang ? clientTokens.tokens : null;
}

// Shiki ends a line before "\r"; a diff line keeps it
function tokensMatchLine(tokens: CodeTokenLines[number], plain: string): boolean {
  let offset = 0;
  for (const token of tokens) {
    if (!plain.startsWith(token.content, offset)) return false;
    offset += token.content.length;
  }
  return offset === plain.length || (offset === plain.length - 1 && plain.endsWith("\r"));
}

export function CodeTokenLine({ tokens, plain }: { tokens: CodeTokenLines[number] | null; plain: string }): ReactNode {
  if (!tokens || tokens.length === 0 || !tokensMatchLine(tokens, plain)) return plain;
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
}: {
  index?: number;
  number: number;
  tokens: CodeTokenLines[number] | null;
  plain: string;
  overflow: CodeOverflow;
  showLineNumbers: boolean;
  highlighted: boolean;
  measureRef?: (node: HTMLDivElement | null) => void;
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
    >
      {showLineNumbers ? (
        <span data-control-ui="code" data-control-family="code" data-slot="gutter" aria-hidden="true" className="shrink-0 select-none">
          {number}
        </span>
      ) : null}
      <code className={cn("min-w-0 flex-1", overflow === "wrap" ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
        {/* a row holding no text node is skipped by text selection, losing the blank line on copy */}
        {plain === "" ? "\n" : <CodeTokenLine tokens={tokens} plain={plain} />}
      </code>
    </div>
  );
}

export type CodeContentProps = Omit<ComponentProps<"div">, "children" | "style"> & {
  code: string;
  lang?: string;
  fileName?: string;
  tokens?: CodeTokenLines | null;
  highlight?: CodeHighlight;
  showLineNumbers?: boolean;
  startLine?: number;
  highlightLines?: readonly number[];
  maxHeight?: string;
  virtualize?: boolean;
  /** Names of the copy button a headerless surface overlays. */
  copyLabel?: string;
  copiedLabel?: string;
  copyFailedLabel?: string;
  style?: CSSProperties & CodeKnobStyle;
};

export function CodeContent({
  code,
  lang,
  fileName,
  tokens,
  highlight = "auto",
  showLineNumbers = false,
  startLine = 1,
  highlightLines,
  maxHeight = "32rem",
  virtualize,
  copyLabel,
  copiedLabel,
  copyFailedLabel,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ref,
  style,
  ...props
}: CodeContentProps) {
  const { density, overflow, hasHeader, copy } = useCodeContext();
  const regionLabel = ariaLabelledby ? ariaLabel : (ariaLabel ?? fileName ?? (lang ? `${lang} code` : "Code"));
  const resolvedTokens = useCodeTokens({ code, lang, tokens, highlight });
  const plainLines = useMemo(() => code.split(/\r?\n/), [code]);
  const highlightedLineNumbers = new Set(highlightLines);
  const isCompact = density === "compact";

  const scrollRef = useRef<HTMLDivElement>(null);
  function setScrollElement(node: HTMLDivElement | null) {
    scrollRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }
  const shouldVirtualize = virtualize ?? plainLines.length > MAX_STATIC_CODE_LINES;

  // react-doctor-disable-next-line react-hooks-js/incompatible-library
  const virtualizer = useVirtualizer({
    count: plainLines.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_LINE_HEIGHT,
    overscan: 24,
    enabled: shouldVirtualize,
  });
  const virtualItems = virtualizer.getVirtualItems();

  const gridClassName = overflow === "scroll" ? "w-max min-w-full" : "w-full";
  const gridStyle: CodeGridStyle = showLineNumbers
    ? { ...style, "--_code-gutter-digits": String(startLine + plainLines.length - 1).length }
    : { ...style };

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
        style={{ ...gridStyle, position: "relative", height: `${virtualizer.getTotalSize()}px` }}
      >
        {/* rows share one in-flow window, so each spans the widest rendered line as in the static grid */}
        <div className={cn("absolute start-0 top-0", gridClassName)} style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}>
          {virtualItems.map((item) => (
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
            />
          ))}
        </div>
      </div>
    </>
  ) : (
    <div
      data-control-ui="code"
      data-control-family="code"
      data-slot="grid"
      data-density={isCompact ? "compact" : "default"}
      className={gridClassName}
      style={gridStyle}
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

  const content = (
    <ScrollArea
      maxHeight={maxHeight}
      aria-label={regionLabel}
      aria-labelledby={ariaLabelledby}
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
  );

  if (hasHeader || !copy) return content;

  return (
    <div data-control-ui="code" data-control-family="code" data-slot="floating-frame" className="relative">
      <CodeFloatingCopy value={code} aria-label={copyLabel} copiedAriaLabel={copiedLabel} copyFailedLabel={copyFailedLabel} />
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
      data-focus-ring="none"
      value={currentValue}
      onChange={handleChange}
      aria-label={ariaLabel ?? (fileName ? `${fileName} code` : "Code editor")}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      className={cn(
        "block w-full max-w-full resize-y overflow-auto",
        overflow === "scroll" ? "whitespace-pre" : "whitespace-pre-wrap break-words",
        className,
      )}
      {...props}
    />
  );
}
