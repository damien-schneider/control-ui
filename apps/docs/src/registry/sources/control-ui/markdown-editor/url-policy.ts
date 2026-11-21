export function isEditorUrl(value: string, image = false): boolean {
  if (!value || /[\s\\]/.test(value) || Array.from(value).some((character) => character.charCodeAt(0) < 32)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (!image && value.startsWith("#")) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:", ...(image ? [] : ["mailto:"])].includes(url.protocol);
  } catch {
    return false;
  }
}

export type MarkdownUrlKind = "link" | "image";
/** Decides which URLs the editor keeps. Content with a refused URL stays in source mode, so nothing is dropped. */
export type MarkdownUrlPolicy = (url: string, kind: MarkdownUrlKind) => boolean;

/** Web apps only keep URLs that still resolve after a reload: HTTP(S), mailto, root-relative paths and anchors. */
export const persistentUrlPolicy: MarkdownUrlPolicy = (url, kind) => isEditorUrl(url, kind === "image");
