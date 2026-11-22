"use client";

import type { RefObject } from "react";
import { createContext, useContext, useState } from "react";

export type ChatWorkspaceSide = "left" | "right";

export type ChatWorkspacePresentation = "floating" | "docked";

export type ChatWorkspaceContextValue = {
  docked: boolean;
  presentation: ChatWorkspacePresentation;
  canDock: boolean;
  expanded: boolean;
  side: ChatWorkspaceSide;
  panelWidth: number;
  minPanelWidth: number;
  maxPanelWidth: number;
  minMainWidth: number;
  panelId: string;
  collapsibleId: string;
  setDocked: (docked: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  setPanelWidth: (width: number) => void;
  clampPanelWidth: (width: number) => number;
};

export type ChatWorkspaceElements = {
  rootRef: RefObject<HTMLDivElement | null>;
  mainRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  registerPanel: (panel: HTMLElement | null) => void;
  registerInset: (inset: HTMLDivElement | null) => void;
};

export const ChatWorkspaceContext = createContext<ChatWorkspaceContextValue | null>(null);

export const ChatWorkspaceElementsContext = createContext<ChatWorkspaceElements | null>(null);

export function useChatWorkspace(): ChatWorkspaceContextValue {
  const workspace = useContext(ChatWorkspaceContext);
  if (!workspace) throw new Error("useChatWorkspace() must be called inside <ChatWorkspace>.");
  return workspace;
}

export function useChatWorkspaceElements(): ChatWorkspaceElements {
  const elements = useContext(ChatWorkspaceElementsContext);
  if (!elements) throw new Error("ChatWorkspace parts must be rendered inside <ChatWorkspace>.");
  return elements;
}

export function useControllableState<T>(controlled: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled ?? uncontrolled;
  function setValue(next: T) {
    if (controlled === undefined) setUncontrolled(next);
    onChange?.(next);
  }
  return [value, setValue] as const;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
