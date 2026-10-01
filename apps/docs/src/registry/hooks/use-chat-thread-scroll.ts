import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";

const BOTTOM_THRESHOLD = 24;
const SETTLE_TIMEOUT = 700;

type ScrollAnchor = { element: Element; offset: number };

function firstVisibleChild(list: Element, viewportTop: number) {
  const children = list.children;
  let low = 0;
  let high = children.length - 1;
  let found: Element | undefined;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (children[middle].getBoundingClientRect().bottom > viewportTop) {
      found = children[middle];
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }
  return found;
}

export function useChatThreadScroll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const settlingRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function scrollToBottom(behavior?: ScrollBehavior) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    pinnedRef.current = true;
    setAtBottom(true);
    clearTimeout(settlingRef.current);
    settlingRef.current = setTimeout(() => {
      settlingRef.current = undefined;
    }, SETTLE_TIMEOUT);
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: behavior ?? (prefersReducedMotion(viewport) ? "auto" : "smooth") });
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const messageList = content?.firstElementChild;
    if (!viewport || !content || !messageList) return;
    let anchor: ScrollAnchor | undefined;

    function rememberAnchor() {
      if (!viewport || !messageList) return;
      const viewportTop = viewport.getBoundingClientRect().top;
      const element = firstVisibleChild(messageList, viewportTop);
      anchor = element ? { element, offset: element.getBoundingClientRect().top - viewportTop } : undefined;
    }

    // Browsers skip native scroll anchoring at offset 0, exactly where older history loads in.
    function keepAnchorInPlace() {
      if (!viewport || !anchor?.element.isConnected) return;
      const drift = anchor.element.getBoundingClientRect().top - viewport.getBoundingClientRect().top - anchor.offset;
      if (drift !== 0) viewport.scrollTop += drift;
    }

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

    function handleScroll() {
      rememberAnchor();
      readPosition();
    }

    const observer = new ResizeObserver(() => {
      if (!viewport) return;
      if (pinnedRef.current) viewport.scrollTop = viewport.scrollHeight;
      else keepAnchorInPlace();
      handleScroll();
    });
    observer.observe(content);
    observer.observe(viewport);
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    viewport.addEventListener("scrollend", settle);
    viewport.scrollTop = viewport.scrollHeight;
    handleScroll();

    return () => {
      observer.disconnect();
      clearTimeout(settlingRef.current);
      viewport.removeEventListener("scroll", handleScroll);
      viewport.removeEventListener("scrollend", settle);
    };
  }, []);

  return { viewportRef, contentRef, atBottom, scrollToBottom };
}
