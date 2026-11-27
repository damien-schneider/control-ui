export type TokenKind = "plain" | "name" | "string" | "keyword" | "function" | "number" | "type" | "swatch";

export type Token = { kind: TokenKind; text: string; start: number };

export type SourceLine = { number: number; text: string; tokens: Token[] };

type Language = "css" | "tsx";

const tokenPattern = /"[^"]*"|--[\w-]+|\d[\w.%]*|[A-Za-z_$][\w$-]*|\s+|[^\s\w"]/g;
const colorPattern = /^oklch\([^)]*\)/;

function tsxKind(text: string): TokenKind {
  if (text === "export" || text === "const") return "keyword";
  if (text === "true" || text === "false") return "number";
  return /^[A-Z]/.test(text) ? "type" : "name";
}

function cssKind(text: string, next: string, inValue: boolean): TokenKind {
  if (text.startsWith("--")) return "name";
  if (!inValue) return "plain";
  return next === "(" ? "function" : "name";
}

function wordKind(text: string, next: string, language: Language, inValue: boolean): TokenKind {
  if (text.startsWith('"')) return "string";
  if (/^\d/.test(text)) return "number";
  if (/^[A-Za-z_$-]/.test(text)) return language === "tsx" ? tsxKind(text) : cssKind(text, next, inValue);
  if (language === "css" && inValue && (text === "(" || text === ")")) return "number";
  return "plain";
}

function tokenizeLine(text: string, language: Language): Token[] {
  const tokens: Token[] = [];
  const isDeclaration = language === "css" && text.trimStart().startsWith("--");
  let inValue = false;
  for (const match of text.matchAll(tokenPattern)) {
    const word = match[0];
    const start = match.index;
    const rest = text.slice(start);
    if (inValue && colorPattern.test(rest)) tokens.push({ kind: "swatch", text: colorPattern.exec(rest)?.[0] ?? word, start: start - 0.5 });
    tokens.push({ kind: wordKind(word, text[start + word.length] ?? "", language, inValue), text: word, start });
    if (isDeclaration && word === ":") inValue = true;
    if (word === ";") inValue = false;
  }
  return tokens;
}

export function tokenizeSource(source: string, language: Language): SourceLine[] {
  return source.split("\n").map((text, index) => ({ number: index + 1, text, tokens: tokenizeLine(text, language) }));
}
