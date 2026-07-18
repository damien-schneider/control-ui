// compat shim — code primitives (Code, CodeDiff, CodeBlockEditor, markdown fences) share one Shiki
// tokenizer (code-tokens.ts) on a CSS-var theme, so syntax colors follow the active skin; keeps
// original CodeBlockEditor* names working so existing callers need no import changes

import type { CodeToken, CodeTokenLines, CodeTokenStyle } from "./code-tokens";
import { highlightToTokens, normalizeLanguage as normalizeCodeLanguage } from "./code-tokens";

export type CodeBlockEditorToken = CodeToken;
export type CodeBlockEditorTokenLines = CodeTokenLines;
export type CodeBlockEditorTokenStyle = CodeTokenStyle;

export const highlightCodeToTokens = highlightToTokens;
export const normalizeLanguage = normalizeCodeLanguage;
