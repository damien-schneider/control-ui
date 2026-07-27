"use client";

import type { CSSProperties } from "react";
import { useId } from "react";
import { flushSync } from "react-dom";
import { startMorphViewTransition } from "@/components/control-ui/extensions/view-transition";

// trigger wears shared name while closed, surface while open. That alternation is whole contract:
// View Transitions API aborts outright when two live elements claim one name at capture, which is exactly what a
// portalled popup mounting over still-present trigger would do. Matching is by name, not tree position, so it
// crosses portals and top layer. unnamed trigger stays uncaptured and keeps painting under overlay —
// hide it with data-[popup-open]:opacity-0 when it should BECOME surface instead.
export type UseMorphTransitionOptions = {
  /** Open state of surface — decides which end of pair currently owns shared name. */
  open: boolean;
  /** Override generated name; only needed when trigger and surface live in separate React trees. */
  name?: string;
};

export type MorphAnchorProps = {
  className: string | undefined;
  style: CSSProperties | undefined;
};

export type UseMorphTransitionResult = {
  /** Wraps state change that opens or closes surface. Falls through untouched when morphing is off. */
  morph: (update: () => void) => void;
  triggerProps: MorphAnchorProps;
  surfaceProps: MorphAnchorProps;
};

type MorphStyle = CSSProperties & Record<"--morph-name", string>;

const MORPH_CLASS = "morph-surface";
const INERT_ANCHOR: MorphAnchorProps = { className: undefined, style: undefined };

// view-transition-name takes custom-ident; useId ships delimiters (:r1:, «r1») that are not valid idents.
function toCustomIdent(id: string) {
  return `aui-morph-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export function useMorphTransition({ open, name }: UseMorphTransitionOptions): UseMorphTransitionResult {
  const generatedId = useId();
  const morphName = name ?? toCustomIdent(generatedId);

  const style: MorphStyle = { "--morph-name": morphName };
  const anchor: MorphAnchorProps = { className: MORPH_CLASS, style };

  // browser snapshots before `update` and again right after it returns, so React's async commit would capture same frame twice
  function morph(update: () => void) {
    startMorphViewTransition(() => flushSync(update));
  }

  return {
    morph,
    triggerProps: open ? INERT_ANCHOR : anchor,
    surfaceProps: open ? anchor : INERT_ANCHOR,
  };
}
