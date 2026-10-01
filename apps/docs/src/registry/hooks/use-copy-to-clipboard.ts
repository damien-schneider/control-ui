import { useEffect, useRef, useState } from "react";

export type UseCopyToClipboardOptions = {
  text?: string;
  copiedDuration?: number;
  onCopy?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
};

export type CopyStatus = "idle" | "copied" | "failed";

export type UseCopyToClipboardResult = {
  status: CopyStatus;
  copyToClipboard: (value: string) => Promise<boolean>;
  resetCopied: () => void;
};

export type UseCopyToClipboardConfiguredResult = UseCopyToClipboardResult & {
  handleCopy: () => Promise<boolean>;
};

async function copyViaClipboardApi(value: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function copyViaSelection(value: string) {
  if (typeof document === "undefined" || typeof document.execCommand !== "function" || !document.body) return false;

  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const textarea = document.createElement("textarea");

  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.insetBlockStart = "0";
  textarea.style.insetInlineStart = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);

  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
    activeElement?.focus({ preventScroll: true });
  }
}

export async function copyTextToClipboard(value: string) {
  if (await copyViaClipboardApi(value)) return true;
  return copyViaSelection(value);
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions & { text: string }): UseCopyToClipboardConfiguredResult;
export function useCopyToClipboard(options?: UseCopyToClipboardOptions): UseCopyToClipboardResult;
export function useCopyToClipboard({ text, copiedDuration = 1200, onCopy, onCopyError }: UseCopyToClipboardOptions = {}) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimeout = useRef<number | null>(null);

  useEffect(() => {
    const timeoutRef = resetTimeout;

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function resetCopied() {
    if (resetTimeout.current) window.clearTimeout(resetTimeout.current);
    resetTimeout.current = null;
    setStatus("idle");
  }

  function settle(next: Exclude<CopyStatus, "idle">) {
    setStatus(next);
    if (resetTimeout.current) window.clearTimeout(resetTimeout.current);
    resetTimeout.current = next === "copied" ? window.setTimeout(() => setStatus("idle"), copiedDuration) : null;
    return next === "copied";
  }

  async function copyToClipboard(value: string) {
    const copied = await copyTextToClipboard(value);
    if (!copied) {
      onCopyError?.(new Error("Unable to copy text"));
      return settle("failed");
    }

    try {
      onCopy?.(value);
    } catch (error) {
      onCopyError?.(error);
      return settle("failed");
    }

    return settle("copied");
  }

  function handleCopy() {
    return text !== undefined ? copyToClipboard(text) : Promise.resolve(false);
  }

  const state = { status, copyToClipboard, resetCopied };
  return text === undefined ? state : { ...state, handleCopy };
}
