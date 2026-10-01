"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";
import { Children, createContext, isValidElement, useContext, useEffect, useId, useRef, useState } from "react";
import type { RenderProp, SelectionIndicator } from "@/components/control-ui/control-props";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import type { TreeKnobStyle } from "@/components/control-ui/knob-contracts/tree-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";

export type TreeSelectionMode = "none" | "single" | "multiple";

export type TreeInteractionReason = "pointer" | "keyboard" | "imperative";

export type TreeSelectionChangeDetails = {
  value: string;
  reason: TreeInteractionReason;
};

export type TreeExpandedChangeDetails = {
  value: string;
  expanded: boolean;
  reason: TreeInteractionReason;
};

export type TreeSelectionIndicator = SelectionIndicator;

export type TreeProps = Omit<Omit<ComponentProps<"ul">, "onChange" | "defaultValue">, "style"> & {
  style?: CSSProperties & TreeKnobStyle;
} & {
  selectionMode?: TreeSelectionMode;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], details: TreeSelectionChangeDetails) => void;
  expandedValue?: string[];
  defaultExpandedValue?: string[];
  onExpandedChange?: (expanded: string[], details: TreeExpandedChangeDetails) => void;
  indicator?: TreeSelectionIndicator;
};

export type TreeItemProps = Omit<ComponentProps<"li">, "value"> & {
  value: string;
  disabled?: boolean;
  label?: string;
  children?: ReactNode;
};

export type TreeItemTriggerProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & TreeKnobStyle } & {
  render?: RenderProp<ComponentProps<"div">>;
};

export type TreeItemIndicatorProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & TreeKnobStyle };

export type TreeItemLabelProps = ComponentProps<"span"> & {
  render?: RenderProp<ComponentProps<"span">>;
};

export type TreeItemContentProps = ComponentProps<"div"> & { style?: CSSProperties & TreeKnobStyle };

const TYPEAHEAD_TIMEOUT = 500;

type RegisterTreeItem = (item: RegisteredTreeItem) => () => void;

type TreeContextValue = {
  selectionMode: TreeSelectionMode;
  indicator: TreeSelectionIndicator;
  selected: ReadonlySet<string>;
  expanded: ReadonlySet<string>;
  tabStopValue: string | null;
  registerItem: RegisterTreeItem;
  registerLabel: (value: string, node: HTMLSpanElement | null) => (() => void) | undefined;
  getNavigableItems: () => RegisteredTreeItem[];
  getItemFromTarget: (target: HTMLElement, root: HTMLElement) => RegisteredTreeItem | undefined;
  getLabel: (value: string) => string;
  getItem: (value: string) => RegisteredTreeItem | undefined;
  select: (value: string, reason: "pointer" | "keyboard", toggle: boolean) => void;
  toggleExpanded: (value: string, force?: boolean, reason?: "pointer" | "keyboard") => void;
  setFocusedValue: (value: string) => void;
};

const TreeContext = createContext<TreeContextValue | null>(null);

function useTree() {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("Tree parts must be used within <Tree>.");
  }
  return context;
}

type TreeItemContextValue = {
  value: string;
  level: number;
  disabled: boolean;
  expandable: boolean;
  labelId: string;
  setLabelled: (labelled: boolean) => void;
};

const TreeItemContext = createContext<TreeItemContextValue | null>(null);

function useTreeItem() {
  const context = useContext(TreeItemContext);
  if (!context) {
    throw new Error("TreeItem parts must be used within <TreeItem>.");
  }
  return context;
}

type TreeItemStyle = CSSProperties & { "--_tree-level"?: number };
type TypeaheadRef = { current: { query: string; at: number } };
type RegisteredTreeItem = {
  value: string;
  parentValue: string | undefined;
  node: HTMLLIElement;
  level: number;
  disabled: boolean;
  expandable: boolean;
  label?: string;
};

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") return ref(value);
  if (ref) ref.current = value;
}

function labelOf(item: RegisteredTreeItem, ctx: TreeContextValue): string {
  return item.label ?? ctx.getLabel(item.value);
}

function compareTreeItems(a: RegisteredTreeItem, b: RegisteredTreeItem): number {
  const position = a.node.compareDocumentPosition(b.node);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
}

function isUnderExpandedAncestors(
  item: RegisteredTreeItem,
  items: ReadonlyMap<string, RegisteredTreeItem>,
  expanded: ReadonlySet<string>,
): boolean {
  for (let parentValue = item.parentValue; parentValue !== undefined; parentValue = items.get(parentValue)?.parentValue) {
    if (!expanded.has(parentValue)) return false;
  }
  return true;
}

function reachableItems(items: ReadonlyMap<string, RegisteredTreeItem>, expanded: ReadonlySet<string>): RegisteredTreeItem[] {
  return [...items.values()].filter((item) => isUnderExpandedAncestors(item, items, expanded)).sort(compareTreeItems);
}

function resolveTabStop(
  items: ReadonlyMap<string, RegisteredTreeItem>,
  expanded: ReadonlySet<string>,
  selected: ReadonlySet<string>,
  focusedValue: string | null,
): string | null {
  const reachable = reachableItems(items, expanded);
  if (reachable.some((item) => item.value === focusedValue)) return focusedValue;
  const enabled = reachable.filter((item) => !item.disabled);
  return (enabled.find((item) => selected.has(item.value)) ?? enabled[0])?.value ?? null;
}

function focusItem(item: RegisteredTreeItem | undefined, ctx: TreeContextValue): void {
  if (!item) return;
  ctx.setFocusedValue(item.value);
  item.node.focus();
}

function focusParentItem(items: RegisteredTreeItem[], index: number, level: number, ctx: TreeContextValue): void {
  for (let itemIndex = index - 1; itemIndex >= 0; itemIndex--) {
    const item = items[itemIndex];
    if (!item || item.level !== level - 1) continue;
    focusItem(item, ctx);
    return;
  }
}

function handleTypeahead(
  event: KeyboardEvent<HTMLUListElement>,
  items: RegisteredTreeItem[],
  index: number,
  ctx: TreeContextValue,
  typeahead: TypeaheadRef,
): void {
  if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return;
  const now = Date.now();
  typeahead.current.query = now - typeahead.current.at > TYPEAHEAD_TIMEOUT ? event.key : typeahead.current.query + event.key;
  typeahead.current.at = now;
  const typed = typeahead.current.query.toLowerCase();
  const cyclesOneCharacter = [...typed].every((character) => character === typed[0]);
  const query = cyclesOneCharacter ? typed.charAt(0) : typed;
  const searchStart = query.length === 1 ? index + 1 : index;
  const ordered = [...items.slice(searchStart), ...items.slice(0, searchStart)];
  const match = ordered.find((item) => labelOf(item, ctx).toLowerCase().startsWith(query));
  if (match) focusItem(match, ctx);
}

type TreeKeyboardState = {
  item: RegisteredTreeItem;
  items: RegisteredTreeItem[];
  index: number;
  isExpanded: boolean;
};

function getTreeKeyboardState(event: KeyboardEvent<HTMLUListElement>, ctx: TreeContextValue): TreeKeyboardState | null {
  if (event.defaultPrevented || !(event.target instanceof HTMLElement)) return null;
  const item = ctx.getItemFromTarget(event.target, event.currentTarget);
  if (!item) return null;

  const items = ctx.getNavigableItems();
  const index = items.indexOf(item);
  if (index === -1) return null;

  return { item, items, index, isExpanded: ctx.expanded.has(item.value) };
}

const RTL_ARROW_KEYS: Record<string, string> = { ArrowLeft: "ArrowRight", ArrowRight: "ArrowLeft" };

function handleInlineArrow(
  key: "ArrowRight" | "ArrowLeft",
  { item, items, index, isExpanded }: TreeKeyboardState,
  ctx: TreeContextValue,
): void {
  const isBranch = item.expandable && !item.disabled;
  if (key === "ArrowRight") {
    if (!isBranch) return;
    if (isExpanded) focusItem(items[index + 1], ctx);
    else ctx.toggleExpanded(item.value, true, "keyboard");
    return;
  }
  if (isBranch && isExpanded) ctx.toggleExpanded(item.value, false, "keyboard");
  else focusParentItem(items, index, item.level, ctx);
}

function activateItem(key: "Enter" | " ", item: RegisteredTreeItem, ctx: TreeContextValue): void {
  if (item.disabled) return;
  if (key === " ") {
    ctx.select(item.value, "keyboard", ctx.selectionMode === "multiple");
    return;
  }
  ctx.select(item.value, "keyboard", false);
  if (item.expandable) ctx.toggleExpanded(item.value, undefined, "keyboard");
}

function handleTreeKeyDown(event: KeyboardEvent<HTMLUListElement>, ctx: TreeContextValue, typeahead: TypeaheadRef): void {
  const state = getTreeKeyboardState(event, ctx);
  if (!state) return;
  const { item, items, index } = state;
  const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
  const key = (rtl && RTL_ARROW_KEYS[event.key]) || event.key;

  switch (key) {
    case "ArrowDown":
      event.preventDefault();
      focusItem(items[index + 1], ctx);
      break;
    case "ArrowUp":
      event.preventDefault();
      focusItem(items[index - 1], ctx);
      break;
    case "ArrowRight":
    case "ArrowLeft":
      event.preventDefault();
      handleInlineArrow(key, state, ctx);
      break;
    case "Home":
      event.preventDefault();
      focusItem(items[0], ctx);
      break;
    case "End":
      event.preventDefault();
      focusItem(items[items.length - 1], ctx);
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      activateItem(key, item, ctx);
      break;
    default:
      handleTypeahead(event, items, index, ctx, typeahead);
  }
}

export function Tree({
  selectionMode = "single",
  indicator,
  value,
  defaultValue,
  onValueChange,
  expandedValue,
  defaultExpandedValue,
  onExpandedChange,
  className,
  style,
  children,
  onKeyDown,
  onFocusCapture,
  ...props
}: TreeProps) {
  const skin = useSkin();
  const [selectedState, setSelectedState] = useState(() => new Set(defaultValue));
  const [expandedState, setExpandedState] = useState(() => new Set(defaultExpandedValue));
  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const [items, setItems] = useState<ReadonlyMap<string, RegisteredTreeItem>>(() => new Map());
  const [registerItem] = useState<RegisterTreeItem>(() => (item: RegisteredTreeItem) => {
    setItems((current) => new Map(current).set(item.value, item));
    return () =>
      setItems((current) => {
        if (current.get(item.value) !== item) return current;
        const next = new Map(current);
        next.delete(item.value);
        return next;
      });
  });

  const selected = value ? new Set(value) : selectedState;
  const expanded = expandedValue ? new Set(expandedValue) : expandedState;

  const typeahead = useRef({ query: "", at: 0 });
  const labelsRef = useRef(new Map<string, HTMLSpanElement>());
  const registerLabel = (itemValue: string, node: HTMLSpanElement | null) => {
    if (!node) return;
    labelsRef.current.set(itemValue, node);
    return () => {
      if (labelsRef.current.get(itemValue) === node) labelsRef.current.delete(itemValue);
    };
  };
  const getNavigableItems = () => reachableItems(items, expanded).filter((item) => item.node.checkVisibility());
  const getItemFromTarget = (target: HTMLElement, root: HTMLElement) => {
    const node = target.closest('[data-control-family="tree"][data-slot="item"]');
    if (!(node instanceof HTMLLIElement) || !root.contains(node)) return;
    const item = items.get(node.dataset.value ?? "");
    return item?.node === node ? item : undefined;
  };
  const getLabel = (itemValue: string) => labelsRef.current.get(itemValue)?.textContent ?? "";
  const getItem = (itemValue: string) => items.get(itemValue);

  const select = (itemValue: string, reason: "pointer" | "keyboard", toggle: boolean) => {
    if (selectionMode === "none") return;
    let next: Set<string>;
    if (selectionMode === "single" || !toggle) {
      next = new Set([itemValue]);
    } else {
      next = new Set(selected);
      if (next.has(itemValue)) next.delete(itemValue);
      else next.add(itemValue);
    }
    if (!value) setSelectedState(next);
    onValueChange?.([...next], { value: itemValue, reason });
  };

  const toggleExpanded = (itemValue: string, force?: boolean, reason: "pointer" | "keyboard" = "pointer") => {
    const willExpand = force ?? !expanded.has(itemValue);
    const next = new Set(expanded);
    if (willExpand) next.add(itemValue);
    else next.delete(itemValue);
    if (!expandedValue) setExpandedState(next);
    onExpandedChange?.([...next], { value: itemValue, expanded: willExpand, reason });
  };

  const resolvedIndicator = indicator ?? skin.indicators?.tree ?? "none";

  const contextValue: TreeContextValue = {
    selectionMode,
    indicator: resolvedIndicator,
    selected,
    expanded,
    tabStopValue: resolveTabStop(items, expanded, selected, focusedValue),
    registerItem,
    registerLabel,
    getNavigableItems,
    getItemFromTarget,
    getLabel,
    getItem,
    select,
    toggleExpanded,
    setFocusedValue,
  };
  const sliding = resolvedIndicator === "slide";

  const list = (
    <ul
      data-control-ui="tree"
      data-control-family="tree"
      data-slot="list"
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WAI-ARIA treeview requires role="tree" on the <ul> container.
      role="tree"
      aria-multiselectable={selectionMode === "multiple" || undefined}
      className="flex flex-col"
      onKeyDown={(event) => {
        onKeyDown?.(event);
        handleTreeKeyDown(event, contextValue, typeahead);
      }}
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        if (event.target instanceof HTMLElement) {
          const focused = contextValue.getItemFromTarget(event.target, event.currentTarget);
          if (focused) setFocusedValue(focused.value);
        }
      }}
      {...props}
    >
      {children}
    </ul>
  );

  return (
    <TreeContext.Provider value={contextValue}>
      <div
        data-control-ui="tree"
        data-control-family="tree"
        data-slot="root"
        data-indicator={resolvedIndicator}
        className={cn(sliding && "relative isolate", className)}
        style={style}
      >
        {sliding ? (
          <TrackHighlight
            itemSelector="[data-control-ui=tree][data-slot=item-trigger]"
            activeSelector="[data-control-ui=tree][data-slot=item-trigger][data-selected]"
          />
        ) : null}
        {list}
      </div>
    </TreeContext.Provider>
  );
}

export function TreeItem({ value, disabled = false, label, className, style, children, ref, ...props }: TreeItemProps) {
  const tree = useTree();
  const parent = useContext(TreeItemContext);
  const parentValue = parent?.value;
  const level = (parent?.level ?? 0) + 1;
  const expandable = Children.toArray(children).some((child) => isValidElement(child) && child.type === TreeItemContent);
  const labelId = useId();
  const [labelled, setLabelled] = useState(false);
  const nodeRef = useRef<HTMLLIElement | null>(null);
  const { registerItem } = tree;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    return registerItem({ value, parentValue, node, level, disabled, expandable, label });
  }, [registerItem, value, parentValue, level, disabled, expandable, label]);

  const expanded = expandable && tree.expanded.has(value);
  const selected = tree.selected.has(value);
  const itemContext: TreeItemContextValue = { value, level, disabled, expandable, labelId, setLabelled };
  const itemRef = (node: HTMLElement | null) => {
    nodeRef.current = node instanceof HTMLLIElement ? node : null;
    return setRef(ref, nodeRef.current);
  };

  const baseClass = cn("list-none", className);
  const itemStyle = { "--_tree-level": level, ...style } satisfies TreeItemStyle;

  const shared = {
    "aria-labelledby": labelled ? labelId : undefined,
    ...props,
    "data-control-ui": "tree",
    "data-control-family": "tree",
    "data-slot": "item",
    "data-value": value,
    "data-label": label,
    "data-selected": selected || undefined,
    "data-disabled": disabled || undefined,
    role: "treeitem",
    "aria-level": level,
    "aria-selected": tree.selectionMode === "none" ? undefined : selected,
    "aria-disabled": disabled || undefined,
    tabIndex: tree.tabStopValue === value ? 0 : -1,
    style: itemStyle,
  };

  if (!expandable) {
    return (
      <TreeItemContext.Provider value={itemContext}>
        <li ref={itemRef} {...shared} className={baseClass}>
          {children}
        </li>
      </TreeItemContext.Provider>
    );
  }

  return (
    <TreeItemContext.Provider value={itemContext}>
      <CollapsiblePrimitive.Root
        ref={itemRef}
        open={expanded}
        onOpenChange={(open) => tree.toggleExpanded(value, open)}
        render={(renderProps) => (
          <li
            {...renderProps}
            {...shared}
            role="treeitem"
            aria-expanded={expanded}
            tabIndex={shared.tabIndex}
            data-state={expanded ? "open" : "closed"}
            className={cn(renderProps.className, baseClass)}
          />
        )}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </TreeItemContext.Provider>
  );
}

export function TreeItemTrigger({ className, children, onClick, render, ...props }: TreeItemTriggerProps) {
  const tree = useTree();
  const item = useTreeItem();
  const expanded = item.expandable && tree.expanded.has(item.value);
  const selected = tree.selected.has(item.value);

  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      "data-control-ui": "tree",
      "data-control-family": "tree",
      "data-slot": "item-trigger",
      "data-state": expanded ? "open" : "closed",
      "data-selected": selected || undefined,
      "aria-disabled": item.disabled || undefined,
      onClick: (event: MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (item.disabled) return;
        const toggle = tree.selectionMode === "multiple" && (event.metaKey || event.ctrlKey);
        tree.select(item.value, "pointer", toggle);
        if (item.expandable) tree.toggleExpanded(item.value);
        focusItem(tree.getItem(item.value), tree);
      },
      className: cn("flex cursor-pointer select-none items-center", "aria-disabled:pointer-events-none", className),
      children,
    },
  });
}

export function TreeItemIndicator({ className, children, ...props }: TreeItemIndicatorProps) {
  const tree = useTree();
  const item = useTreeItem();

  if (!item.expandable) {
    return (
      <span
        data-control-ui="tree"
        data-control-family="tree"
        data-slot="item-indicator"
        aria-hidden
        className={cn("inline-flex shrink-0", className)}
        {...props}
      />
    );
  }

  const expanded = tree.expanded.has(item.value);

  return (
    <span
      data-control-ui="tree"
      data-control-family="tree"
      data-slot="item-indicator"
      data-state={expanded ? "open" : "closed"}
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon data-icon-dir="inline" className="size-4" />}
    </span>
  );
}

export function TreeItemLabel({ className, children, render, ref, ...props }: TreeItemLabelProps) {
  const tree = useTree();
  const item = useTreeItem();
  const { setLabelled } = item;
  useEffect(() => {
    setLabelled(true);
    return () => setLabelled(false);
  }, [setLabelled]);
  const labelRef = (node: HTMLSpanElement | null) => {
    const unregister = tree.registerLabel(item.value, node);
    const cleanup = setRef(ref, node);
    if (!node) return;
    return () => {
      unregister?.();
      if (typeof cleanup === "function") cleanup();
      else setRef(ref, null);
    };
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: {
      title: typeof children === "string" ? children : undefined,
      ...props,
      ref: labelRef,
      id: item.labelId,
      "data-control-ui": "tree",
      "data-control-family": "tree",
      "data-slot": "item-label",
      className: cn("min-w-0 flex-1 truncate", className),
      children,
    },
  });
}

export function TreeItemContent({ className, children, ...props }: TreeItemContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      {...props}
      render={(renderProps, state) => (
        <div
          {...renderProps}
          data-control-ui="tree"
          data-control-family="tree"
          data-slot="item-content"
          data-state={state.open ? "open" : "closed"}
          className={renderProps.className}
        />
      )}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: WAI-ARIA treeview requires role="group" on the nested child list. */}
      <ul role="group" data-control-ui="tree" data-control-family="tree" data-slot="item-group" className={cn("flex flex-col", className)}>
        {children}
      </ul>
    </CollapsiblePrimitive.Panel>
  );
}
