"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { readContractTokens } from "@/components/theme-drawer/read-vars";
import type { TokenValues } from "@/components/theme-drawer/types";

function subscribeToThemeChanges(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-skin", "style"] });
  return () => observer.disconnect();
}

export function useContractTokens(): TokenValues {
  const [tokens, setTokens] = useState<TokenValues>({});
  useEffect(() => {
    const readTokens = () => setTokens(readContractTokens());
    readTokens();
    return subscribeToThemeChanges(readTokens);
  }, []);
  return tokens;
}

export function useComputedReadout<Element extends HTMLElement>(
  read: (style: CSSStyleDeclaration) => string,
): [RefObject<Element | null>, string] {
  const ref = useRef<Element>(null);
  const [readout, setReadout] = useState("");
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const readElement = () => setReadout(read(getComputedStyle(element)));
    readElement();
    return subscribeToThemeChanges(readElement);
  }, [read]);
  return [ref, readout];
}

export function formatPx(value: string) {
  const px = Number.parseFloat(value);
  return Number.isNaN(px) ? value : `${Math.round(px * 10) / 10}px`;
}
