"use client";

import type { CSSProperties } from "react";
import { useId } from "react";
import { flushSync } from "react-dom";
import { startMorphViewTransition } from "@/components/control-ui/extensions/view-transition";

// React binding for the shared-element morph preset (extensions/view-transition.ts + effects.css .morph-surface).
// Hands out one name and two prop bags: the trigger wears it while closed, the surface while open. That alternation
// is the whole contract — the View Transitions API aborts outright if two live elements claim one name at capture,
// which is exactly what happens when a portalled popup mounts over a trigger that stayed in the DOM.
//
// Consequence worth knowing: this works across a portal and across the top layer, because the browser matches by
// name and not by tree position. A dialog can morph out of its trigger without either side moving in the tree.
//
// The alternation also decides what the trigger looks like while open: unnamed means uncaptured, so it keeps
// painting live under the transition overlay while its own snapshot flies away with the box. That reads right for
// a dialog whose trigger belongs to the page; hide it (data-[popup-open]:opacity-0) for a container-transform read
// where the trigger is meant to BECOME the surface.

export type UseMorphTransitionOptions = {
  /** Open state of the surface — decides which end of the pair currently owns the shared name. */
  open: boolean;
  /** Override the generated name; only needed when trigger and surface live in separate React trees. */
  name?: string;
};

export type MorphAnchorProps = {
  className: string | undefined;
  style: CSSProperties | undefined;
};

export type UseMorphTransitionResult = {
  /** Wraps the state change that opens or closes the surface. Falls through untouched when morphing is off. */
  morph: (update: () => void) => void;
  triggerProps: MorphAnchorProps;
  surfaceProps: MorphAnchorProps;
};

type MorphStyle = CSSProperties & Record<"--morph-name", string>;

const MORPH_CLASS = "morph-surface";
const INERT_ANCHOR: MorphAnchorProps = { className: undefined, style: undefined };

// view-transition-name takes a custom-ident; useId ships delimiters (:r1:, «r1») that are not valid idents.
function toCustomIdent(id: string) {
  return `aui-morph-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export function useMorphTransition({ open, name }: UseMorphTransitionOptions): UseMorphTransitionResult {
  const generatedId = useId();
  const morphName = name ?? toCustomIdent(generatedId);

  const style: MorphStyle = { "--morph-name": morphName };
  const anchor: MorphAnchorProps = { className: MORPH_CLASS, style };

  // The browser snapshots the old state before `update` and the new one right after it returns, so the DOM change
  // has to land synchronously — React's default async commit would let it capture the same frame twice.
  function morph(update: () => void) {
    startMorphViewTransition(() => flushSync(update));
  }

  return {
    morph,
    triggerProps: open ? INERT_ANCHOR : anchor,
    surfaceProps: open ? anchor : INERT_ANCHOR,
  };
}
