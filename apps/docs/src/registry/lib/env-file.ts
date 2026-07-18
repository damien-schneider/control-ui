export interface EnvironmentVariableEntry {
  key: string;
  value: string;
}

export const ENV_FILE_MAX_SIZE = 64 * 1024;
export const DUPLICATE_ENVIRONMENT_VARIABLE_MESSAGE = "Environment variable keys must be unique";

export class DuplicateEnvironmentVariableKeyError extends Error {
  constructor(public readonly key: string) {
    super(DUPLICATE_ENVIRONMENT_VARIABLE_MESSAGE);
    this.name = "DuplicateEnvironmentVariableKeyError";
  }
}

export function createEmptyEnvironmentVariableEntry(): EnvironmentVariableEntry {
  return { key: "", value: "" };
}

export function rowsFromEnvironmentVariables(envVars: Record<string, unknown> | undefined): EnvironmentVariableEntry[] {
  const entries = Object.entries(envVars ?? {});
  return entries.length > 0 ? entries.map(([key, value]) => ({ key, value: String(value) })) : [createEmptyEnvironmentVariableEntry()];
}

export function getDuplicateEnvironmentVariableKeys(rows: readonly EnvironmentVariableEntry[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;

    if (seen.has(key)) {
      duplicates.add(key);
    } else {
      seen.add(key);
    }
  }

  return duplicates;
}

export function collectEnvironmentVariables(rows: readonly EnvironmentVariableEntry[]): Record<string, string> {
  const envVars: Record<string, string> = {};
  const seen = new Set<string>();

  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;

    if (seen.has(key)) {
      throw new DuplicateEnvironmentVariableKeyError(key);
    }

    seen.add(key);
    envVars[key] = row.value;
  }

  return envVars;
}

function parseEnvAssignment(line: string): { key: string; rawValue: string } | undefined {
  const normalizedLine = line.trim();
  if (!normalizedLine || normalizedLine.startsWith("#")) return undefined;

  const stripped = normalizedLine.replace(/^export\s+/, "");
  const equalsIndex = stripped.indexOf("=");
  if (equalsIndex === -1) return undefined;

  const key = stripped.slice(0, equalsIndex).trim();
  if (!key) return undefined;
  return { key, rawValue: stripped.slice(equalsIndex + 1) };
}

function openingQuote(value: string): '"' | "'" | undefined {
  if (value.startsWith('"')) return '"';
  if (value.startsWith("'")) return "'";
  return undefined;
}

function parseUnquotedEnvValue(rawValue: string): string {
  const commentIndex = rawValue.indexOf(" #");
  return (commentIndex === -1 ? rawValue : rawValue.slice(0, commentIndex)).trim();
}

function parseQuotedEnvValue(lines: string[], lineIndex: number, value: string, quote: '"' | "'") {
  const closingIndex = findClosingQuoteIndex(value, quote, 1);
  if (closingIndex !== -1) {
    return { value: unescapeQuotedValue(value.slice(1, closingIndex), quote), nextLineIndex: lineIndex + 1 };
  }

  const parts = [value.slice(1)];
  let nextLineIndex = lineIndex + 1;
  while (nextLineIndex < lines.length) {
    const nextLine = lines[nextLineIndex];
    if (nextLine === undefined) break;
    const endIndex = findClosingQuoteIndex(nextLine, quote);
    if (endIndex !== -1) {
      parts.push(nextLine.slice(0, endIndex));
      nextLineIndex += 1;
      break;
    }
    parts.push(nextLine);
    nextLineIndex += 1;
  }

  return { value: unescapeQuotedValue(parts.join("\n"), quote), nextLineIndex };
}

function parseEnvValue(lines: string[], lineIndex: number, rawValue: string) {
  const value = rawValue.trimStart();
  const quote = openingQuote(value);
  if (quote) return parseQuotedEnvValue(lines, lineIndex, value, quote);
  return { value: parseUnquotedEnvValue(rawValue), nextLineIndex: lineIndex + 1 };
}

export function parseEnvFileText(text: string): EnvironmentVariableEntry[] {
  const results: EnvironmentVariableEntry[] = [];
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const currentLine = lines[lineIndex];
    if (currentLine === undefined) break;
    const assignment = parseEnvAssignment(currentLine);
    if (!assignment) {
      lineIndex++;
      continue;
    }

    const parsedValue = parseEnvValue(lines, lineIndex, assignment.rawValue);
    results.push({ key: assignment.key, value: parsedValue.value });
    lineIndex = parsedValue.nextLineIndex;
  }

  return results;
}

function findClosingQuoteIndex(value: string, quote: '"' | "'", startIndex = 0): number {
  for (let index = startIndex; index < value.length; index++) {
    if (value[index] === quote && !isEscaped(value, index)) {
      return index;
    }
  }
  return -1;
}

function isEscaped(value: string, index: number): boolean {
  let slashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor--) {
    slashCount++;
  }
  return slashCount % 2 === 1;
}

const DOUBLE_QUOTED_CONTROL_ESCAPES: Readonly<Record<string, string | undefined>> = {
  n: "\n",
  r: "\r",
  t: "\t",
};

function escapedQuotedCharacter(next: string, quote: '"' | "'"): string | undefined {
  if (next === quote || next === "\\") return next;
  if (quote === "'") return undefined;
  return DOUBLE_QUOTED_CONTROL_ESCAPES[next];
}

function unescapeQuotedValue(value: string, quote: '"' | "'"): string {
  let result = "";

  for (let index = 0; index < value.length; index++) {
    const current = value[index];
    const next = value[index + 1];

    if (current !== "\\" || next === undefined) {
      result += current;
      continue;
    }

    const unescaped = escapedQuotedCharacter(next, quote);
    result += unescaped ?? current;
    if (unescaped !== undefined) index++;
  }

  return result;
}

function escapeDoubleQuotedValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function shouldQuoteValue(value: string) {
  return value.includes("\n") || value.includes("\r") || value.includes(" #") || /^\s|\s$/.test(value);
}

export function rowsToEnvFileText(rows: readonly EnvironmentVariableEntry[]): string {
  const lines: string[] = [];

  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;

    const value = row.value;
    lines.push(shouldQuoteValue(value) ? `${key}="${escapeDoubleQuotedValue(value)}"` : `${key}=${value}`);
  }

  return lines.join("\n");
}

export async function readEnvFile(
  file: File,
  options: { maxSize?: number } = {},
): Promise<{ ok: true; entries: EnvironmentVariableEntry[] } | { ok: false; error: string }> {
  const maxSize = options.maxSize ?? ENV_FILE_MAX_SIZE;

  if (file.size > maxSize) {
    return { ok: false, error: `File is too large (max ${Math.ceil(maxSize / 1024)} KB).` };
  }

  let text: string;
  try {
    text = await readFileText(file);
  } catch {
    return { ok: false, error: "Could not read the selected file. Please try again." };
  }

  if (text.includes("\0")) {
    return { ok: false, error: "File appears to be binary. Please import a plain-text .env file." };
  }

  const entries = parseEnvFileText(text);
  if (entries.length === 0) {
    return { ok: false, error: "No valid environment variables found in the file." };
  }

  return { ok: true, entries };
}

async function readFileText(file: File): Promise<string> {
  if (typeof file.text === "function") {
    try {
      return await file.text();
    } catch {
      // Some test DOMs expose Blob.text without implementing every Blob source.
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("FileReader returned non-text content."));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed."));
    reader.readAsText(file);
  });
}
