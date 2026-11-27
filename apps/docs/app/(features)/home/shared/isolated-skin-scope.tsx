"use client";

import { type ComponentProps, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/components/control-ui/lib/cn";
import { type ControlUiSkin, skinScopeAttributes } from "@/components/control-ui/skin";
import { SkinProvider } from "@/components/control-ui/skin-provider";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";

const STYLE_SOURCES = 'link[rel="stylesheet"], style';

function isLoadingLink(node: Element): node is HTMLLinkElement {
  return node instanceof HTMLLinkElement && !node.sheet;
}

function whenSettled(link: HTMLLinkElement) {
  const { promise, resolve } = Promise.withResolvers<void>();
  link.addEventListener("load", () => resolve(), { once: true });
  link.addEventListener("error", () => resolve(), { once: true });
  return promise;
}

function dropRemovedSources(copies: Map<Element, Element>, sources: readonly Element[]) {
  const live = new Set(sources);
  for (const [source, copy] of copies) {
    if (live.has(source)) continue;
    copy.remove();
    copies.delete(source);
  }
}

function refreshCopy(source: Element, copy: Element) {
  if (source.localName === "style" && copy.textContent !== source.textContent) copy.textContent = source.textContent;
  return copy;
}

function insertCopy(source: Element, previous: Element | null, holder: Element) {
  const copy = source.cloneNode(true);
  if (!(copy instanceof Element)) return null;
  if (previous) previous.after(copy);
  else holder.prepend(copy);
  return copy;
}

function mirrorHeadStyles(shadow: ShadowRoot) {
  const holder = document.createElement("div");
  holder.style.display = "none";
  shadow.prepend(holder);
  const copies = new Map<Element, Element>();

  function sync() {
    const sources = [...document.head.querySelectorAll(STYLE_SOURCES)];
    dropRemovedSources(copies, sources);
    let previous: Element | null = null;
    for (const source of sources) {
      const existing = copies.get(source);
      const copy: Element | null = existing ? refreshCopy(source, existing) : insertCopy(source, previous, holder);
      if (!copy) continue;
      copies.set(source, copy);
      previous = copy;
    }
  }

  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.head, { childList: true, subtree: true, characterData: true });

  return {
    ready: Promise.all([...copies.values()].filter(isLoadingLink).map(whenSettled)),
    stop() {
      observer.disconnect();
      holder.remove();
    },
  };
}

export function IsolatedSkinScope({ skin, children, ...props }: ComponentProps<"div"> & { skin: ControlUiSkin }) {
  const { isDark } = useThemeRuntime();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (!host) return;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const styles = mirrorHeadStyles(shadow);
    let active = true;
    styles.ready.then(() => {
      if (active) setRoot(shadow);
    });
    return () => {
      active = false;
      styles.stop();
      setRoot(null);
    };
  }, [host]);

  return (
    <div {...props}>
      <div {...skinScopeAttributes(skin)} ref={setHost} className="contents">
        {root
          ? createPortal(
              <SkinProvider skin={skin}>
                <div className={cn("size-full", isDark && "dark")}>
                  <div {...skinScopeAttributes(skin)} className="size-full bg-background font-sans text-foreground">
                    {children}
                  </div>
                </div>
              </SkinProvider>,
              root,
            )
          : null}
      </div>
    </div>
  );
}
