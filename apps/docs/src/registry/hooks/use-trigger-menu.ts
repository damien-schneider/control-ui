import type { ReactNode } from "react";
import { useId, useReducer, useRef } from "react";
import type { TriggerMatch } from "../lib/trigger-detect";

export type TriggerMenuItemData = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  keywords?: readonly string[];
  disabled?: boolean;
  kind?: string;
  image?: string;
};

export type TriggerSelectContext = { char: string; query: string };

export type TriggerConfig<Item extends TriggerMenuItemData = TriggerMenuItemData> = {
  char: string;
  items: readonly Item[] | ((query: string) => readonly Item[]);
  filter?: (item: Item, query: string) => boolean;
  insert?: "replace" | "none";
  insertText?: (item: Item) => string;
  onSelect?: (item: Item, ctx: TriggerSelectContext) => void;
};

// Never touches DOM or editor: binding feeds state through `report` and performs insertion through `onCommit`,
// which is what lets one popup serve plain <textarea> and ProseMirror editor unchanged.

export type UseTriggerMenuOptions<Item extends TriggerMenuItemData> = {
  triggers: readonly TriggerConfig<Item>[];
  // backend-specific mutation for chosen item — mention replace, slash-command, and so on
  onCommit: (item: Item, trigger: TriggerConfig<Item>, match: TriggerMatch) => void;
};

/**
 * Popup attributes for the element that keeps focus (textarea or editor) while the menu is up. It stays a
 * multiline textbox (a <textarea> can't take role="combobox"), so open state is conveyed by `aria-controls`.
 */
export type TriggerMenuInputAria = {
  "aria-autocomplete": "list";
  "aria-haspopup": "listbox";
  "aria-controls"?: string;
  "aria-activedescendant"?: string;
};

export type TriggerMenuController<Item extends TriggerMenuItemData> = {
  open: boolean;
  items: readonly Item[];
  activeIndex: number;
  anchorRect: DOMRect | null;
  activeChar: string | null;
  query: string;
  /** Id for `TriggerMenuList`; the input's `aria-controls` points at it. */
  listId: string;
  /** Id for the option at `index`; the input's `aria-activedescendant` points at the active one. */
  optionId: (index: number) => string;
  inputAria: TriggerMenuInputAria;
  /** Binding → engine: publish current trigger match (or null) and caret rect to anchor to. */
  report: (match: TriggerMatch | null, anchorRect: DOMRect | null) => void;
  /** Binding → engine: route keydown while open. Returns true when engine consumed key. */
  handleKeyDown: (key: string) => boolean;
  /** View → engine. */
  setActiveIndex: (index: number) => void;
  select: (item: Item) => void;
  close: () => void;
  setOpen: (open: boolean) => void;
};

type DismissedMatch = { char: string; start: number; query: string };

export type TriggerMenuState = {
  open: boolean;
  char: string | null;
  query: string;
  anchorRect: DOMRect | null;
  activeIndex: number;
  dismissed: DismissedMatch | null;
};

export type TriggerMenuAction =
  | { type: "report"; match: TriggerMatch | null; anchorRect: DOMRect | null }
  | { type: "close"; dismissed: DismissedMatch | null }
  | { type: "move"; delta: number; count: number }
  | { type: "activate"; index: number };

export const CLOSED_TRIGGER_MENU: TriggerMenuState = {
  open: false,
  char: null,
  query: "",
  anchorRect: null,
  activeIndex: 0,
  dismissed: null,
};

/** A dismissed token stays closed until its query changes, so keyup/click re-detection after Escape can't reopen it. */
export function triggerMenuReducer(state: TriggerMenuState, action: TriggerMenuAction): TriggerMenuState {
  switch (action.type) {
    case "report": {
      const { match, anchorRect } = action;
      if (match === null) return { ...CLOSED_TRIGGER_MENU };
      const { dismissed } = state;
      if (dismissed !== null && dismissed.char === match.char && dismissed.start === match.start && dismissed.query === match.query) {
        return { ...CLOSED_TRIGGER_MENU, dismissed };
      }
      const activeIndex = state.open && state.char === match.char && state.query === match.query ? state.activeIndex : 0;
      return { open: true, char: match.char, query: match.query, anchorRect, activeIndex, dismissed: null };
    }
    case "close":
      return { ...CLOSED_TRIGGER_MENU, dismissed: action.dismissed };
    case "move":
      return {
        ...state,
        activeIndex: action.count === 0 ? 0 : (state.activeIndex + action.delta + action.count) % action.count,
      };
    case "activate":
      return { ...state, activeIndex: action.index };
  }
}

function matchesQuery(item: TriggerMenuItemData, query: string): boolean {
  if (query === "") return true;
  const needle = query.toLowerCase();
  if (item.label.toLowerCase().includes(needle)) return true;
  return (item.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(needle));
}

function resolveItems<Item extends TriggerMenuItemData>(trigger: TriggerConfig<Item>, query: string): readonly Item[] {
  if (typeof trigger.items === "function") return trigger.items(query);
  const filter = trigger.filter ?? matchesQuery;
  return trigger.items.filter((item) => filter(item, query));
}

/** Keys an IME is still composing must never reach the menu or the composer's submit. */
export function isComposingKey(event: { isComposing: boolean; keyCode: number }): boolean {
  return event.isComposing || event.keyCode === 229;
}

export type TriggerMenuKeyIntent = "next" | "previous" | "commit" | "dismiss" | "pass";

/** What a key means to an open menu; an empty list passes Enter/Tab through so newline, submit and Tab-out still work. */
export function triggerMenuKeyIntent(key: string, open: boolean, itemCount: number): TriggerMenuKeyIntent {
  if (!open) return "pass";
  if (key === "ArrowDown") return "next";
  if (key === "ArrowUp") return "previous";
  if (key === "Escape") return "dismiss";
  if ((key === "Enter" || key === "Tab") && itemCount > 0) return "commit";
  return "pass";
}

export function useTriggerMenu<Item extends TriggerMenuItemData>({
  triggers,
  onCommit,
}: UseTriggerMenuOptions<Item>): TriggerMenuController<Item> {
  const [state, dispatch] = useReducer(triggerMenuReducer, CLOSED_TRIGGER_MENU);
  const lastMatch = useRef<TriggerMatch | null>(null);
  const listId = useId();

  const activeTrigger = state.char === null ? null : (triggers.find((trigger) => trigger.char === state.char) ?? null);
  const items = activeTrigger === null ? [] : resolveItems(activeTrigger, state.query);
  const optionId = (index: number) => `${listId}-option-${index}`;
  const hasActiveItem = state.open && state.activeIndex < items.length;

  function dismiss() {
    const match = lastMatch.current;
    lastMatch.current = null;
    dispatch({ type: "close", dismissed: match === null ? null : { char: match.char, start: match.start, query: match.query } });
  }

  function close() {
    lastMatch.current = null;
    dispatch({ type: "close", dismissed: null });
  }

  function select(item: Item) {
    const match = lastMatch.current;
    if (activeTrigger !== null && match !== null) onCommit(item, activeTrigger, match);
    close();
  }

  function report(match: TriggerMatch | null, anchorRect: DOMRect | null) {
    const known = match !== null && triggers.some((trigger) => trigger.char === match.char);
    lastMatch.current = known ? match : null;
    dispatch({ type: "report", match: known ? match : null, anchorRect });
  }

  function handleKeyDown(key: string): boolean {
    const intent = triggerMenuKeyIntent(key, state.open, items.length);
    if (intent === "next" || intent === "previous") {
      dispatch({ type: "move", delta: intent === "next" ? 1 : -1, count: items.length });
    } else if (intent === "commit") {
      const item = items[state.activeIndex];
      if (item && !item.disabled) select(item);
    } else if (intent === "dismiss") {
      dismiss();
    }
    return intent !== "pass";
  }

  function setOpen(open: boolean) {
    if (!open) dismiss();
  }

  function setActiveIndex(index: number) {
    dispatch({ type: "activate", index });
  }

  return {
    open: state.open,
    items,
    activeIndex: state.activeIndex,
    anchorRect: state.anchorRect,
    activeChar: state.char,
    query: state.query,
    listId,
    optionId,
    inputAria: {
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
      "aria-controls": state.open ? listId : undefined,
      "aria-activedescendant": hasActiveItem ? optionId(state.activeIndex) : undefined,
    },
    report,
    handleKeyDown,
    setActiveIndex,
    select,
    close,
    setOpen,
  };
}
