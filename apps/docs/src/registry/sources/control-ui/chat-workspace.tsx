"use client";

import { ChevronDown, PanelLeft, PanelRight, PictureInPicture2 } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent, RefObject } from "react";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { foldPanel } from "@/components/control-ui/chat-workspace-fold";
import {
  ChatWorkspaceContext,
  type ChatWorkspaceContextValue,
  ChatWorkspaceElementsContext,
  type ChatWorkspaceSide,
  clamp,
  useChatWorkspace,
  useChatWorkspaceElements,
  useControllableState,
} from "@/components/control-ui/chat-workspace-state";
import { startMorphViewTransition } from "@/components/control-ui/extensions/view-transition";
import { cn } from "@/components/control-ui/lib/cn";
import { Button, type ButtonProps } from "@/components/control-ui/ui/button";

// biome-ignore lint/performance/noBarrelFile: The workspace exposes one install-facing API across its split files.
export { ChatWorkspaceResizeHandle, type ChatWorkspaceResizeHandleProps } from "@/components/control-ui/chat-workspace-resize-handle";
export {
  type ChatWorkspaceContextValue,
  type ChatWorkspacePresentation,
  type ChatWorkspaceSide,
  useChatWorkspace,
} from "@/components/control-ui/chat-workspace-state";

const DEFAULT_PANEL_WIDTH = 384;
const DEFAULT_MIN_PANEL_WIDTH = 288;
const DEFAULT_MAX_PANEL_WIDTH = 640;
const DEFAULT_MIN_MAIN_WIDTH = 320;
const MORPH_CLASS = "aui-morph";
const MORPH_NAME = "cui-chat-workspace";

export type ChatWorkspaceProps = ComponentProps<"div"> & {
  side?: ChatWorkspaceSide;
  docked?: boolean;
  defaultDocked?: boolean;
  onDockedChange?: (docked: boolean) => void;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  panelWidth?: number;
  defaultPanelWidth?: number;
  onPanelWidthChange?: (width: number) => void;
  minPanelWidth?: number;
  maxPanelWidth?: number;
  /** Narrowest the main content may get beside a pinned panel; below it the panel floats instead. */
  minMainWidth?: number;
};

function useFits(rootRef: RefObject<HTMLDivElement | null>, required: number) {
  const [fits, setFits] = useState(true);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setFits(root.clientWidth >= required);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef, required]);
  return fits;
}

function useInsets(rootRef: RefObject<HTMLDivElement | null>, panel: HTMLElement | null, docked: boolean) {
  const insetsRef = useRef(new Set<HTMLDivElement>());
  const updateRef = useRef(() => {});

  useLayoutEffect(() => {
    updateRef.current = () => {
      const root = rootRef.current;
      let size = 0;
      if (root && panel && !docked) {
        const gap = Number.parseFloat(getComputedStyle(panel).marginBlockEnd) || 0;
        size = Math.max(0, root.getBoundingClientRect().bottom - panel.getBoundingClientRect().top + gap);
      }
      for (const inset of insetsRef.current) inset.style.blockSize = `${size}px`;
    };
    updateRef.current();
  }, [rootRef, panel, docked]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => updateRef.current());
    observer.observe(root);
    if (panel) observer.observe(panel);
    return () => observer.disconnect();
  }, [rootRef, panel]);

  return useCallback((inset: HTMLDivElement | null) => {
    if (!inset) return;
    insetsRef.current.add(inset);
    updateRef.current();
    return () => {
      insetsRef.current.delete(inset);
    };
  }, []);
}

function useMorph(elements: { panelRef: RefObject<HTMLElement | null>; mainRef: RefObject<HTMLDivElement | null> }) {
  const token = useId().replace(/[^a-zA-Z0-9]/g, "");
  const activeRef = useRef<ViewTransition | undefined>(undefined);

  function name(named: boolean) {
    const parts = [
      [elements.panelRef.current, `${MORPH_NAME}-panel-${token}`],
      [elements.mainRef.current, `${MORPH_NAME}-main-${token}`],
    ] as const;
    for (const [element, value] of parts) {
      if (!element) continue;
      element.style.viewTransitionName = named ? value : "";
      element.style.setProperty("view-transition-class", named ? MORPH_CLASS : "");
    }
  }

  return function morph(update: () => void) {
    name(true);
    const transition = startMorphViewTransition(() => flushSync(update));
    activeRef.current = transition;
    if (!transition) {
      name(false);
      return;
    }
    transition.finished
      .catch(() => {})
      .finally(() => {
        if (activeRef.current !== transition) return;
        activeRef.current = undefined;
        name(false);
      });
  };
}

export function ChatWorkspace({
  side = "right",
  docked: dockedProp,
  defaultDocked = false,
  onDockedChange,
  expanded: expandedProp,
  defaultExpanded = true,
  onExpandedChange,
  panelWidth: panelWidthProp,
  defaultPanelWidth = DEFAULT_PANEL_WIDTH,
  onPanelWidthChange,
  minPanelWidth = DEFAULT_MIN_PANEL_WIDTH,
  maxPanelWidth = DEFAULT_MAX_PANEL_WIDTH,
  minMainWidth = DEFAULT_MIN_MAIN_WIDTH,
  className,
  children,
  ...props
}: ChatWorkspaceProps) {
  const [docked, setDockedState] = useControllableState(dockedProp, defaultDocked, onDockedChange);
  const [requestedExpanded, setExpanded] = useControllableState(expandedProp, defaultExpanded, onExpandedChange);
  const [requestedWidth, setRequestedWidth] = useControllableState(panelWidthProp, defaultPanelWidth, onPanelWidthChange);
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [panel, setPanel] = useState<HTMLElement | null>(null);
  const registerPanel = useCallback((element: HTMLElement | null) => {
    panelRef.current = element;
    setPanel(element);
  }, []);
  const panelId = useId();
  const collapsibleId = useId();

  const canDock = useFits(rootRef, minMainWidth + minPanelWidth);
  const presentation = docked && canDock ? "docked" : "floating";
  const registerInset = useInsets(rootRef, panel, presentation === "docked");
  const morph = useMorph({ panelRef, mainRef });
  const expanded = presentation === "docked" || requestedExpanded;

  function clampPanelWidth(width: number) {
    const room = rootRef.current ? rootRef.current.clientWidth - minMainWidth : maxPanelWidth;
    return Math.round(clamp(width, minPanelWidth, Math.min(maxPanelWidth, room)));
  }

  const workspace: ChatWorkspaceContextValue = {
    docked,
    presentation,
    canDock,
    expanded,
    side,
    panelWidth: Math.round(clamp(requestedWidth, minPanelWidth, maxPanelWidth)),
    minPanelWidth,
    maxPanelWidth,
    minMainWidth,
    panelId,
    collapsibleId,
    setDocked: (next) => {
      if (next === docked) return;
      morph(() => setDockedState(next));
    },
    setExpanded: (next) => foldPanel(rootRef.current, panelRef.current, () => flushSync(() => setExpanded(next))),
    setPanelWidth: (width) => setRequestedWidth(clamp(width, minPanelWidth, maxPanelWidth)),
    clampPanelWidth,
  };

  return (
    <ChatWorkspaceContext.Provider value={workspace}>
      <ChatWorkspaceElementsContext.Provider value={{ rootRef, mainRef, panelRef, registerPanel, registerInset }}>
        <div
          {...props}
          ref={rootRef}
          data-control-ui="chat-workspace"
          data-control-family="chat-workspace"
          data-slot="root"
          data-side={side}
          data-docked={presentation === "docked" ? "" : undefined}
          data-expanded={expanded ? "" : undefined}
          className={cn("relative grid min-h-0 min-w-0", className)}
        >
          {children}
        </div>
      </ChatWorkspaceElementsContext.Provider>
    </ChatWorkspaceContext.Provider>
  );
}

export type ChatWorkspaceMainProps = ComponentProps<"div">;

export function ChatWorkspaceMain({ className, ...props }: ChatWorkspaceMainProps) {
  const { mainRef } = useChatWorkspaceElements();
  return (
    <div
      {...props}
      ref={mainRef}
      data-control-ui="chat-workspace"
      data-control-family="chat-workspace"
      data-slot="main"
      className={cn("min-h-0 min-w-0", className)}
    />
  );
}

export type ChatWorkspacePanelProps = Omit<ComponentProps<"aside">, "id">;

export function ChatWorkspacePanel({ className, style, "aria-label": ariaLabel = "Chat", ...props }: ChatWorkspacePanelProps) {
  const { panelId, panelWidth, minMainWidth, presentation } = useChatWorkspace();
  const { registerPanel } = useChatWorkspaceElements();
  const sized: CSSProperties | undefined =
    presentation === "docked" ? { ...style, inlineSize: `${panelWidth}px`, maxInlineSize: `calc(100cqi - ${minMainWidth}px)` } : style;
  return (
    <aside
      {...props}
      ref={registerPanel}
      id={panelId}
      aria-label={ariaLabel}
      data-control-ui="chat-workspace"
      data-control-family="chat-workspace"
      data-slot="panel"
      className={cn("relative flex min-h-0 min-w-0 flex-col", className)}
      style={sized}
    />
  );
}

export type ChatWorkspaceInsetProps = Omit<ComponentProps<"div">, "children">;

/** Spacer for the end of the main content's scroller, so its last lines can scroll clear of the floating panel. */
export function ChatWorkspaceInset({ className, ...props }: ChatWorkspaceInsetProps) {
  const { registerInset } = useChatWorkspaceElements();
  return (
    <div
      {...props}
      ref={registerInset}
      aria-hidden="true"
      data-control-ui="chat-workspace"
      data-control-family="chat-workspace"
      data-slot="inset"
      className={cn("pointer-events-none shrink-0", className)}
    />
  );
}

export type ChatWorkspaceCollapsibleProps = Omit<ComponentProps<"div">, "id">;

export function ChatWorkspaceCollapsible({ className, ...props }: ChatWorkspaceCollapsibleProps) {
  const { collapsibleId, expanded } = useChatWorkspace();
  return (
    <div
      {...props}
      id={collapsibleId}
      inert={!expanded}
      data-control-ui="chat-workspace"
      data-control-family="chat-workspace"
      data-slot="collapsible"
      className={cn("grid min-h-0 min-w-0", className)}
    />
  );
}

export type ChatWorkspaceExpandToggleProps = Omit<ButtonProps, "aria-expanded" | "aria-controls">;

export function ChatWorkspaceExpandToggle({
  onClick,
  children,
  "aria-label": ariaLabel = "Conversation",
  ...props
}: ChatWorkspaceExpandToggleProps) {
  const { collapsibleId, expanded, presentation, setExpanded } = useChatWorkspace();
  if (presentation === "docked") return null;
  function toggle(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) setExpanded(!expanded);
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      {...props}
      type="button"
      aria-label={ariaLabel}
      aria-expanded={expanded}
      aria-controls={collapsibleId}
      onClick={toggle}
    >
      {children ?? <ChevronDown aria-hidden="true" data-control-family="chat-workspace" data-slot="expand-icon" />}
    </Button>
  );
}

export type ChatWorkspaceDockToggleProps = Omit<ButtonProps, "aria-label"> & {
  pinLabel?: string;
  floatLabel?: string;
};

export function ChatWorkspaceDockToggle({
  onClick,
  children,
  pinLabel = "Pin to side",
  floatLabel = "Float",
  ...props
}: ChatWorkspaceDockToggleProps) {
  const { docked, canDock, side, setDocked } = useChatWorkspace();
  if (!canDock) return null;
  const PinIcon = side === "left" ? PanelLeft : PanelRight;
  function toggle(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) setDocked(!docked);
  }
  return (
    <Button variant="ghost" size="sm" iconOnly {...props} type="button" aria-label={docked ? floatLabel : pinLabel} onClick={toggle}>
      {children ?? (docked ? <PictureInPicture2 aria-hidden="true" /> : <PinIcon aria-hidden="true" />)}
    </Button>
  );
}
