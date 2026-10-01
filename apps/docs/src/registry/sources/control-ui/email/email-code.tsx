import type { CSSProperties } from "react";
import {
  CodeBlock,
  CodeInline,
  type CodeInlineProps,
  Markdown,
  type MarkdownProps,
  type PrismLanguage,
  type Theme as PrismTheme,
  Section,
} from "react-email";
import { type EmailDirection, type EmailSides, type EmailVariant, emailSides, surfaceColors } from "./email";
import type { EmailTheme } from "./theme";

export function EmailInlineCode({ className = "", ...props }: CodeInlineProps) {
  return <CodeInline {...props} className={`rounded-control bg-muted px-1 font-mono text-card-foreground ${className}`} />;
}

function prismTheme(theme: EmailTheme): PrismTheme {
  const { code } = theme;
  return {
    base: {
      margin: "0",
      padding: "16px",
      background: theme.colors.muted,
      color: code.foreground,
      borderRadius: theme.radii.panel,
      fontFamily: theme.fonts.mono,
      fontSize: theme.text.caption.fontSize,
      lineHeight: "1.6",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    },
    comment: { color: code.comment },
    prolog: { color: code.comment },
    doctype: { color: code.comment },
    cdata: { color: code.comment },
    punctuation: { color: code.punctuation },
    operator: { color: code.punctuation },
    keyword: { color: code.keyword },
    atrule: { color: code.keyword },
    "attr-value": { color: code.string },
    string: { color: code.string },
    char: { color: code.string },
    inserted: { color: code.string },
    regex: { color: code.string },
    "attr-name": { color: code.parameter },
    property: { color: code.parameter },
    variable: { color: code.parameter },
    function: { color: code.function },
    "class-name": { color: code.function },
    tag: { color: code.function },
    boolean: { color: code.constant },
    number: { color: code.constant },
    constant: { color: code.constant },
    symbol: { color: code.constant },
    deleted: { color: code.constant },
    builtin: { color: code.constant },
  };
}

export function EmailCodeBlock({
  theme,
  code,
  language,
  lineNumbers = false,
  className = "",
}: {
  theme: EmailTheme;
  code: string;
  language: PrismLanguage;
  lineNumbers?: boolean;
  className?: string;
}) {
  return (
    <Section className={`mb-6 ${className}`}>
      <CodeBlock code={code} language={language} lineNumbers={lineNumbers} fontFamily={theme.fonts.mono} theme={prismTheme(theme)} />
    </Section>
  );
}

function markdownStyles(theme: EmailTheme, variant: EmailVariant, sides: EmailSides): NonNullable<MarkdownProps["markdownCustomStyles"]> {
  const colors = surfaceColors(theme, variant);
  const body: CSSProperties = {
    margin: "0 0 16px",
    fontFamily: theme.fonts.body,
    fontSize: theme.text.body.fontSize,
    lineHeight: theme.text.body.lineHeight,
    color: colors["card-foreground"],
  };
  function headingStyle(size: "heading-1" | "heading-2" | "heading-3" | "heading-4"): CSSProperties {
    const style = theme.text[size];
    return {
      margin: "0 0 16px",
      fontFamily: theme.fonts.display,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacing,
      color: colors["card-foreground"],
    };
  }
  const monospace: CSSProperties = {
    fontFamily: theme.fonts.mono,
    fontSize: theme.text.caption.fontSize,
    background: theme.colors.muted,
    color: theme.code.foreground,
    borderRadius: theme.radii.control,
  };
  const startInset = (length: string): CSSProperties => (sides.start === "left" ? { paddingLeft: length } : { paddingRight: length });
  const startRule = `3px solid ${theme.colors.border}`;
  return {
    p: body,
    li: { ...body, margin: "0 0 4px" },
    ul: { ...body, ...startInset("20px") },
    ol: { ...body, ...startInset("20px") },
    h1: headingStyle("heading-1"),
    h2: headingStyle("heading-2"),
    h3: headingStyle("heading-3"),
    h4: headingStyle("heading-4"),
    h5: headingStyle("heading-4"),
    h6: headingStyle("heading-4"),
    bold: { fontWeight: 600 },
    italic: { fontStyle: "italic" },
    link: { color: colors["primary-text"], textDecoration: "underline" },
    codeInline: { ...monospace, padding: "2px 4px" },
    codeBlock: { ...monospace, display: "block", padding: "16px", borderRadius: theme.radii.panel, whiteSpace: "pre-wrap" },
    blockQuote: {
      ...body,
      ...(sides.start === "left" ? { borderLeft: startRule } : { borderRight: startRule }),
      ...startInset("16px"),
      color: colors["muted-foreground"],
    },
    hr: { border: "none", borderTop: `1px solid ${theme.colors.border}`, margin: "24px 0" },
    image: { maxWidth: "100%", borderRadius: theme.radii.scene },
    table: { width: "100%", borderCollapse: "collapse", marginBottom: "16px" },
    th: { ...body, margin: "0", textAlign: sides.start, padding: "8px 0", borderBottom: `1px solid ${theme.colors.border}` },
    td: { ...body, margin: "0", padding: "8px 0", borderBottom: `1px solid ${theme.colors.border}` },
  };
}

export function EmailMarkdown({
  theme,
  variant = "contained",
  dir,
  children,
}: {
  theme: EmailTheme;
  variant?: EmailVariant;
  dir?: EmailDirection;
  children: string;
}) {
  return <Markdown markdownCustomStyles={markdownStyles(theme, variant, emailSides(dir))}>{children}</Markdown>;
}
