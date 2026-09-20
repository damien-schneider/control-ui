import { useCallback, useEffect, useRef, useState } from "react";

const BOTTOM_THRESHOLD = 24;
const SETTLE_TIMEOUT = 700;

export function useChatThreadScroll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const settlingRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    pinnedRef.current = true;
    setAtBottom(true);
    clearTimeout(settlingRef.current);
    settlingRef.current = setTimeout(() => {
      settlingRef.current = undefined;
    }, SETTLE_TIMEOUT);
    viewport.scrollTo({ top: viewport.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    function settle() {
      clearTimeout(settlingRef.current);
      settlingRef.current = undefined;
      readPosition();
    }

    function readPosition() {
      if (!viewport || settlingRef.current) return;
      const distance = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      pinnedRef.current = distance <= BOTTOM_THRESHOLD;
      setAtBottom(pinnedRef.current);
    }

    const observer = new ResizeObserver(() => {
      if (!viewport) return;
      if (pinnedRef.current) viewport.scrollTop = viewport.scrollHeight;
      else readPosition();
    });
    observer.observe(content);
    observer.observe(viewport);
    viewport.addEventListener("scroll", readPosition, { passive: true });
    viewport.addEventListener("scrollend", settle);
    viewport.scrollTop = viewport.scrollHeight;
    readPosition();

    return () => {
      observer.disconnect();
      clearTimeout(settlingRef.current);
      viewport.removeEventListener("scroll", readPosition);
      viewport.removeEventListener("scrollend", settle);
    };
  }, []);

  return { viewportRef, contentRef, atBottom, scrollToBottom };
}
