"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";
import { Children, createContext, isValidElement, lazy, Suspense, useContext, useRef, useState } from "react";
import type { RenderProp, SelectionIndicator } from "@/components/control-ui/control-props";
import type { TreeKnobStyle } from "@/components/control-ui/knob-contracts/tree-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinIndicator } from "@/components/control-ui/skin";

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

// lazy because highlight drags in JS geometry engine; it is decorative, so null fallback is fine
const TrackHighlight = lazy(() =>
  import("@/components/control-ui/extensions/track-highlight").then((module) => ({ default: module.TrackHighlight })),
);

/*
 * Library-original: Base UI ships no Tree. Follows WAI-ARIA APG treeview — <li> is focusable treeitem, trigger row presentational.
 * Keyboard nav derives visible order from registered item refs at keydown time; collapsed panels unmount, so registry holds exactly reachable items.
 */

const TYPEAHEAD_TIMEOUT = 500;

type TreeContextValue = {
  selectionMode: TreeSelectionMode;
  indicator: TreeSelectionIndicator;
  selected: ReadonlySet<string>;
  expanded: ReadonlySet<string>;
  focusedValue: string | null;
  registerItem: (item: RegisteredTreeItem) => () => void;
  registerLabel: (value: string, node: HTMLSpanElement | null) => (() => void) | undefined;
  getVisibleItems: () => RegisteredTreeItem[];
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

function visibleItems(items: ReadonlyMap<string, RegisteredTreeItem>): RegisteredTreeItem[] {
  return [...items.values()].filter((item) => !item.disabled && item.node.checkVisibility()).sort(compareTreeItems);
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
  const query = typeahead.current.query.toLowerCase();
  const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
  const match = ordered.find((item) => labelOf(item, ctx).toLowerCase().startsWith(query));
  if (match) focusItem(match, ctx);
}

type TreeKeyboardState = {
  value: string;
  items: RegisteredTreeItem[];
  index: number;
  isBranch: boolean;
  isExpanded: boolean;
  level: number;
};

function registeredItemFromTarget(
  target: HTMLElement,
  root: HTMLElement,
  itemsByNode: WeakMap<HTMLElement, RegisteredTreeItem>,
): RegisteredTreeItem | undefined {
  let node: HTMLElement | null = target;
  while (node && root.contains(node)) {
    const item = itemsByNode.get(node);
    if (item) return item;
    if (node === root) return;
    node = node.parentElement;
  }
}

function getTreeKeyboardState(event: KeyboardEvent<HTMLUListElement>, ctx: TreeContextValue): TreeKeyboardState | null {
  if (event.defaultPrevented || !(event.target instanceof HTMLElement)) return null;
  const current = ctx.getItemFromTarget(event.target, event.currentTarget);
  if (!current) return null;

  const items = ctx.getVisibleItems();
  const index = items.indexOf(current);
  if (index === -1) return null;

  return {
    value: current.value,
    items,
    index,
    isBranch: current.expandable,
    isExpanded: ctx.expanded.has(current.value),
    level: current.level,
  };
}

function handleTreeKeyDown(event: KeyboardEvent<HTMLUListElement>, ctx: TreeContextValue, typeahead: TypeaheadRef): void {
  const state = getTreeKeyboardState(event, ctx);
  if (!state) return;
  const { value, items, index, isBranch, isExpanded, level } = state;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      focusItem(items[index + 1], ctx);
      break;
    case "ArrowUp":
      event.preventDefault();
      focusItem(items[index - 1], ctx);
      break;
    case "ArrowRight":
      event.preventDefault();
      if (isBranch && !isExpanded) {
        ctx.toggleExpanded(value, true, "keyboard");
      } else if (isBranch && isExpanded) {
        focusItem(items[index + 1], ctx);
      }
      break;
    case "ArrowLeft":
      event.preventDefault();
      if (isBranch && isExpanded) {
        ctx.toggleExpanded(value, false, "keyboard");
      } else {
        focusParentItem(items, index, level, ctx);
      }
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
      event.preventDefault();
      ctx.select(value, "keyboard", false);
      if (isBranch) ctx.toggleExpanded(value, undefined, "keyboard");
      break;
    case " ":
      event.preventDefault();
      ctx.select(value, "keyboard", ctx.selectionMode === "multiple");
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
  const [selectedState, setSelectedState] = useState(() => new Set(defaultValue));
  const [expandedState, setExpandedState] = useState(() => new Set(defaultExpandedValue));
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

  const selected = value ? new Set(value) : selectedState;
  const expanded = expandedValue ? new Set(expandedValue) : expandedState;

  const typeahead = useRef({ query: "", at: 0 });
  const itemsRef = useRef(new Map<string, RegisteredTreeItem>());
  const itemsByNodeRef = useRef(new WeakMap<HTMLElement, RegisteredTreeItem>());
  const labelsRef = useRef(new Map<string, HTMLSpanElement>());
  const seededFocusRef = useRef(false);
  const registerItem = (item: RegisteredTreeItem) => {
    const previous = itemsRef.current.get(item.value);
    if (previous) itemsByNodeRef.current.delete(previous.node);
    itemsRef.current.set(item.value, item);
    itemsByNodeRef.current.set(item.node, item);
    if (!seededFocusRef.current && !item.disabled) {
      seededFocusRef.current = true;
      setFocusedValue(item.value);
    }
    return () => {
      if (itemsRef.current.get(item.value) !== item) return;
      itemsRef.current.delete(item.value);
      itemsByNodeRef.current.delete(item.node);
    };
  };
  const registerLabel = (itemValue: string, node: HTMLSpanElement | null) => {
    if (!node) return;
    labelsRef.current.set(itemValue, node);
    return () => {
      if (labelsRef.current.get(itemValue) === node) labelsRef.current.delete(itemValue);
    };
  };
  const getVisibleItems = () => visibleItems(itemsRef.current);
  const getItemFromTarget = (target: HTMLElement, root: HTMLElement) => registeredItemFromTarget(target, root, itemsByNodeRef.current);
  const getLabel = (itemValue: string) => labelsRef.current.get(itemValue)?.textContent ?? "";
  const getItem = (itemValue: string) => itemsRef.current.get(itemValue);

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

  // prop → skin → off
  const resolvedIndicator = indicator ?? skinIndicator("tree") ?? "none";

  const contextValue: TreeContextValue = {
    selectionMode,
    indicator: resolvedIndicator,
    selected,
    expanded,
    focusedValue,
    registerItem,
    registerLabel,
    getVisibleItems,
    getItemFromTarget,
    getLabel,
    getItem,
    select,
    toggleExpanded,
    setFocusedValue,
  };
  const rootStyle = style;
  const sliding = resolvedIndicator === "slide";

  const list = (
    <ul
      data-control-ui="tree"
      data-control-family="tree"
      data-indicator={resolvedIndicator}
      data-slot="root"
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WAI-ARIA treeview requires role="tree" on the <ul> container.
      role="tree"
      aria-multiselectable={selectionMode === "multiple" || undefined}
      className={cn("flex flex-col", sliding ? undefined : className)}
      style={sliding ? undefined : rootStyle}
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
      {sliding ? (
        // wrapped, never injected into list: pill must stay sibling of treeitems for the <ul> content model to hold
        <div
          data-control-ui="tree"
          data-control-family="tree"
          data-slot="track"
          data-indicator={resolvedIndicator}
          className={cn("relative isolate", className)}
          style={rootStyle}
        >
          <Suspense fallback={null}>
            <TrackHighlight
              itemSelector="[data-control-ui=tree][data-slot=item-trigger]"
              activeSelector="[data-control-ui=tree][data-slot=item-trigger][data-selected]"
            />
          </Suspense>
          {list}
        </div>
      ) : (
        list
      )}
    </TreeContext.Provider>
  );
}

export function TreeItem({ value, disabled = false, label, className, style, children, ref, ...props }: TreeItemProps) {
  const tree = useTree();
  const parent = useContext(TreeItemContext);
  const level = (parent?.level ?? 0) + 1;
  const expandable = Children.toArray(children).some((child) => isValidElement(child) && child.type === TreeItemContent);

  const expanded = expandable && tree.expanded.has(value);
  const selected = tree.selected.has(value);
  const itemContext: TreeItemContextValue = { value, level, disabled, expandable };
  const itemRef = (node: HTMLElement | null) => {
    const itemNode = node instanceof HTMLLIElement ? node : null;
    const refCleanup = setRef(ref, itemNode);
    if (!itemNode) return;
    const unregister = tree.registerItem({ value, node: itemNode, level, disabled, expandable, label });
    return () => {
      unregister();
      if (typeof refCleanup === "function") refCleanup();
      else setRef(ref, null);
    };
  };

  const baseClass = cn("list-none", className);
  const itemStyle = { "--_tree-level": level, ...style } satisfies TreeItemStyle;

  const shared = {
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
    tabIndex: tree.focusedValue === value ? 0 : -1,
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
            tabIndex={tree.focusedValue === value ? 0 : -1}
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

// presentational — the <li> above owns focus

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
      className: cn(
        "flex cursor-pointer select-none items-center gap-1.5 py-1 pr-2",
        "pl-[calc(var(--\\_tree-level,1)*1.25rem)]",
        "aria-disabled:pointer-events-none",
        className,
      ),
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
        className={cn("inline-flex size-4 shrink-0", className)}
        {...props}
      />
    );
  }

  // rotates off its OWN state: nested chevron sits inside parent's open <li>, so descendant selector would rotate every child when ancestor opens
  const expanded = tree.expanded.has(item.value);

  return (
    <span
      data-control-ui="tree"
      data-control-family="tree"
      data-slot="item-indicator"
      data-state={expanded ? "open" : "closed"}
      aria-hidden
      className={cn("inline-flex size-4 shrink-0 items-center justify-center", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon className="size-4" />}
    </span>
  );
}

// accessible name and type-ahead target

export function TreeItemLabel({ className, children, render, ref, ...props }: TreeItemLabelProps) {
  const tree = useTree();
  const item = useTreeItem();
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
      ...props,
      ref: labelRef,
      "data-control-ui": "tree",
      "data-control-family": "tree",
      "data-slot": "item-label",
      className: cn("min-w-0 flex-1 truncate", className),
      children,
    },
  });
}

// Enter and exit both ride data-starting-style/data-ending-style, which Base UI sets only during transition, so slide plays on close too and never sticks.
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
