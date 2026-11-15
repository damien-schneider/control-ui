import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, readDurationMs } from "../lib/motion";

const ATTACH_THRESHOLD = 24;
const GLIDE_LIMIT = 240;

type ScrollAnchor = { element: HTMLElement; offset: number };

function firstVisibleChild(list: HTMLElement, scrollTop: number) {
  const children = list.children;
  let low = 0;
  let high = children.length - 1;
  let found: HTMLElement | undefined;
  while (low <= high) {
    const middle = (low + high) >> 1;
    const child = children[middle];
    if (child instanceof HTMLElement && child.offsetTop + child.offsetHeight > scrollTop) {
      found = child;
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }
  return found;
}

function distanceToEnd(viewport: HTMLElement) {
  return viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;
}

export function useChatThreadScroll() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const travellingRef = useRef(false);
  const [atBottom, setAtBottom] = useState(true);

  function scrollToBottom(behavior?: ScrollBehavior) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const resolved = behavior ?? (prefersReducedMotion(viewport) ? "auto" : "smooth");
    followingRef.current = true;
    travellingRef.current = resolved === "smooth";
    setAtBottom(true);
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: resolved });
  }

  function followFromDock() {
    if (!followingRef.current) scrollToBottom();
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    const scrollArea = viewport?.parentElement;
    const content = contentRef.current;
    const messageList = content?.firstElementChild;
    if (!viewport || !scrollArea || !content || !(messageList instanceof HTMLElement)) return;
    let anchor: ScrollAnchor | undefined;
    let lastTop = viewport.scrollTop;
    let settled = false;

    const rememberAnchor = () => {
      const element = firstVisibleChild(messageList, viewport.scrollTop);
      anchor = element ? { element, offset: element.offsetTop - viewport.scrollTop } : undefined;
    };

    // Browsers skip native scroll anchoring at offset 0, exactly where older history loads in.
    const keepAnchorInPlace = () => {
      if (!anchor?.element.isConnected) return;
      const drift = anchor.element.offsetTop - viewport.scrollTop - anchor.offset;
      if (drift !== 0) viewport.scrollTop += drift;
    };

    // Streamed lines land instantly at the end; the list slides up from where it was so reading never jumps.
    const glide = (distance: number) => {
      if (!settled || distance <= 0 || distance > GLIDE_LIMIT || prefersReducedMotion(messageList)) return;
      const duration = readDurationMs(messageList, "--duration-base");
      if (duration <= 0) return;
      messageList.animate([{ translate: `0 ${distance}px` }, { translate: "0 0" }], {
        duration,
        easing: getComputedStyle(messageList).getPropertyValue("--ease-emphasized").trim() || "ease-out",
        composite: "add",
      });
    };

    const followEnd = () => {
      if (travellingRef.current) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        return;
      }
      const before = viewport.scrollTop;
      viewport.scrollTop = viewport.scrollHeight;
      glide(viewport.scrollTop - before);
    };

    // Only the reader moves the thread up: growth below never lowers scrollTop, and a shrink clamps it flush with the end.
    const handleScroll = () => {
      const top = viewport.scrollTop;
      const remaining = distanceToEnd(viewport);
      if (top < lastTop && remaining > 1) {
        followingRef.current = false;
        travellingRef.current = false;
      } else if (remaining <= ATTACH_THRESHOLD) {
        followingRef.current = true;
      }
      if (remaining <= 1) travellingRef.current = false;
      lastTop = top;
      rememberAnchor();
      setAtBottom(followingRef.current || remaining <= ATTACH_THRESHOLD);
    };

    const handleResize = () => {
      scrollArea.style.setProperty("--_chat-thread-dock-size", `${dockRef.current?.offsetHeight ?? 0}px`);
      if (followingRef.current) followEnd();
      else keepAnchorInPlace();
      lastTop = viewport.scrollTop;
      rememberAnchor();
      setAtBottom(followingRef.current || distanceToEnd(viewport) <= ATTACH_THRESHOLD);
    };

    const settleTravel = () => {
      travellingRef.current = false;
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(content);
    observer.observe(viewport);
    if (dockRef.current) observer.observe(dockRef.current);
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    viewport.addEventListener("scrollend", settleTravel);
    handleResize();
    settled = true;
    content.setAttribute("data-settled", "");

    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", handleScroll);
      viewport.removeEventListener("scrollend", settleTravel);
      content.removeAttribute("data-settled");
    };
  }, []);

  return { viewportRef, contentRef, dockRef, atBottom, scrollToBottom, followFromDock };
}
