"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { XIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react";
import { Children, createContext, Fragment, isValidElement, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { ControlledChoice, RenderProp } from "@/components/control-ui/control-props";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { TabsKnobStyle } from "@/components/control-ui/knob-contracts/tabs-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkinIcon } from "@/components/control-ui/skin-provider";
import { Button } from "@/components/control-ui/ui/button";

export type TabsProps<TValue extends string = string> = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledChoice<TValue> & { orientation?: "horizontal" | "vertical"; style?: CSSProperties & TabsKnobStyle };

export type TabsListVariant = "default" | "browser";

export type TabsListProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & TabsKnobStyle } & {
  size?: ControlSize;
  variant?: TabsListVariant;
  activateOnFocus?: boolean;
  loopFocus?: boolean;
  /**
   * Scrolls the list along its own axis instead of overflowing when the tabs do not fit. Where scroll-driven animations
   * are supported, the edges that still hide tabs fade out over `--cui-tabs-scroll-fade-size`.
   */
  scrollable?: boolean;
};

export type TabsTabProps = Omit<Omit<ComponentProps<"button">, "value">, "style"> & { style?: CSSProperties & TabsKnobStyle } & {
  value: string;
  render?: RenderProp<ComponentProps<"button">, { active: boolean; disabled: boolean }>;
  nativeButton?: boolean;
  /** Adds a pointer close button; the focused tab also closes with Delete or Backspace. */
  onClose?: () => void;
  closeLabel?: string;
};

export type TabsPanelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & TabsKnobStyle } & {
  value: string;
  keepMounted?: boolean;
};

export type TabsSurfaceProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & TabsKnobStyle };

export function TabsSurface({ className, ...props }: TabsSurfaceProps) {
  return (
    <div data-control-ui="tabs" data-control-family="tabs" data-slot="surface" data-surface="panel" className={className} {...props} />
  );
}

type RegisterTabsPanel = (value: string, node: HTMLDivElement | null) => (() => void) | undefined;

type ActiveTabsPanel = { value: string; node: HTMLDivElement; height: number };

type TabsContextValue = { registerPanel: RegisterTabsPanel; exitingValue: string | null; tabElements: Set<HTMLElement> };

function refreshTabsPanelHeight(panel: ActiveTabsPanel) {
  if (panel.node.inert || panel.node.hidden) return;
  panel.height = panel.node.getBoundingClientRect().height;
}

function setTabsPanelsStarting(panels: HTMLDivElement[], starting: boolean) {
  for (const panel of panels) panel.toggleAttribute("data-slide-starting", starting);
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs parts must be rendered inside <Tabs>.");
  return context;
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") return ref(value);
  if (ref) ref.current = value;
}

export function Tabs<TValue extends string = string>({ className, onValueChange, children, ref, ...props }: TabsProps<TValue>) {
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => {
    if (!rootRef.current) throw new Error("Tabs root is not mounted.");
    return rootRef.current;
  }, []);
  const activePanelRef = useRef<ActiveTabsPanel | null>(null);
  const startingPanelsRef = useRef<HTMLDivElement[]>([]);
  const previousHeightRef = useRef<string | null>(null);
  const clearPreviousHeightFrame = useRef(0);
  const [exitingValue, setExitingValue] = useState<string | null>(null);
  const [tabElements] = useState(() => new Set<HTMLElement>());
  const [holdPreviousHeight] = useState(() => (height: string) => {
    const root = rootRef.current;
    if (!root) return;
    previousHeightRef.current = height;
    cancelAnimationFrame(clearPreviousHeightFrame.current);
    clearPreviousHeightFrame.current = requestAnimationFrame(() => {
      clearPreviousHeightFrame.current = requestAnimationFrame(() => {
        previousHeightRef.current = null;
        activePanelRef.current?.node.style.removeProperty("--_tabs-prev-height");
        setTabsPanelsStarting(startingPanelsRef.current, false);
        startingPanelsRef.current = [];
      });
    });
  });
  useEffect(() => () => cancelAnimationFrame(clearPreviousHeightFrame.current), []);
  const [registerPanel] = useState<RegisterTabsPanel>(() => (value: string, node: HTMLDivElement | null) => {
    const panelCanBeMeasured = node && !node.inert && !node.hidden;
    if (!panelCanBeMeasured) return;
    const previousPanel = activePanelRef.current;
    const root = rootRef.current;
    const switchingPanels = root && previousPanel && previousPanel.value !== value;
    if (switchingPanels) {
      setTabsPanelsStarting(startingPanelsRef.current, false);
      startingPanelsRef.current = [previousPanel.node, node];
      setTabsPanelsStarting(startingPanelsRef.current, true);
      const previousHeight = previousHeightRef.current || `${previousPanel.height}px`;
      node.style.setProperty("--_tabs-prev-height", previousHeight);
      holdPreviousHeight(previousHeight);
      setExitingValue(previousPanel.value);
    }
    activePanelRef.current = { value, node, height: node.getBoundingClientRect().height };
    if (switchingPanels) {
      const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = node;
      previousPanel.node.style.setProperty("--_tabs-panel-top", `${offsetTop}px`);
      previousPanel.node.style.setProperty("--_tabs-panel-left", `${offsetLeft}px`);
      previousPanel.node.style.setProperty("--_tabs-panel-width", `${offsetWidth}px`);
      previousPanel.node.style.setProperty("--_tabs-panel-height", `${offsetHeight}px`);
    }
    return () => {
      const currentPanel = activePanelRef.current;
      if (currentPanel && currentPanel.node === node) refreshTabsPanelHeight(currentPanel);
    };
  });

  const handleValueChange = (value: TValue) => {
    const activePanel = activePanelRef.current;
    if (activePanel) {
      refreshTabsPanelHeight(activePanel);
      holdPreviousHeight(`${activePanel.height}px`);
      setExitingValue(activePanel.value);
    }
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ registerPanel, exitingValue, tabElements }}>
      <TabsPrimitive.Root
        data-control-ui="tabs"
        data-control-family="tabs"
        data-slot="root"
        data-slide="scope"
        className={className}
        onValueChange={handleValueChange}
        {...props}
        ref={rootRef}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  );
}

function countTabs(children: ReactNode): number {
  return Children.toArray(children).reduce<number>((count, child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return count;
    if (child.type === TabsTab) return count + 1;
    if (child.type === Fragment) return count + countTabs(child.props.children);
    return count;
  }, 0);
}

export function TabsList({ size = "sm", variant = "default", scrollable, className, children, ...props }: TabsListProps) {
  const isSingle = countTabs(children) === 1;

  return (
    <TabsPrimitive.List
      data-control-ui="tabs"
      data-control-family="tabs"
      data-slot="list"
      data-size={size}
      data-variant={variant}
      data-single={isSingle ? "true" : undefined}
      data-scrollable={scrollable ? "true" : undefined}
      className={cn(variant === "browser" && "gap-0 p-0 px-(--_tabs-browser-inset) pt-(--cui-tabs-list-padding)", className)}
      {...props}
    >
      {children}
      {isSingle ? null : (
        <TabsPrimitive.Indicator
          data-control-ui="tabs"
          data-control-family="tabs"
          data-slot="indicator"
          className={
            variant === "browser"
              ? "top-auto bottom-0 left-(--_tabs-browser-indicator-x) z-0 h-(--cui-tabs-trigger-height) w-(--_tabs-browser-indicator-width) transform-none"
              : undefined
          }
        />
      )}
    </TabsPrimitive.List>
  );
}

export function TabsTab({ className, onClose, closeLabel = "Close tab", onKeyDown, ref, ...props }: TabsTabProps) {
  const CloseGlyph = useSkinIcon("close", XIcon);
  const tabElements = useContext(TabsContext)?.tabElements;
  const tabRef = (node: HTMLButtonElement | null) => {
    const cleanup = setRef(ref, node);
    if (!node) return;
    tabElements?.add(node);
    return () => {
      tabElements?.delete(node);
      if (typeof cleanup === "function") cleanup();
      else setRef(ref, null);
    };
  };
  const tab = (
    <TabsPrimitive.Tab
      ref={tabRef}
      data-control-ui="tabs"
      data-control-family="tabs"
      data-slot="tab"
      data-closable={onClose ? "true" : undefined}
      aria-keyshortcuts={onClose ? "Delete" : undefined}
      className={className}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!onClose || event.defaultPrevented || (event.key !== "Delete" && event.key !== "Backspace")) return;
        flushSync(onClose);
        [...(tabElements ?? [])].find((element) => element.getAttribute("aria-selected") === "true")?.focus();
      }}
      {...props}
    />
  );
  if (!onClose) return tab;

  return (
    <span data-control-ui="tabs" data-control-family="tabs" data-slot="tab-frame" className="relative inline-flex items-center">
      {tab}
      {/* a tablist may only own tabs, so the button stays pointer-only and Delete closes from the keyboard */}
      <Button
        variant="ghost"
        size="xs"
        iconOnly
        aria-hidden
        tabIndex={-1}
        aria-label={closeLabel}
        data-tabs-close="true"
        className="absolute z-10"
        onClick={onClose}
      >
        <CloseGlyph />
      </Button>
    </span>
  );
}

export function TabsPanel({ className, value, ref, ...props }: TabsPanelProps) {
  const { registerPanel, exitingValue } = useTabsContext();
  const panelRef = (node: HTMLDivElement | null) => {
    const unregister = registerPanel(value, node);
    const cleanup = setRef(ref, node);
    if (!node) return;
    node.parentElement?.toggleAttribute("data-slide-viewport", true);
    return () => {
      unregister?.();
      if (typeof cleanup === "function") cleanup();
      else setRef(ref, null);
    };
  };

  return (
    <TabsPrimitive.Panel
      ref={panelRef}
      value={value}
      data-control-ui="tabs"
      data-control-family="tabs"
      data-slot="panel"
      data-slide="panel"
      data-slide-exiting={exitingValue === value ? "" : undefined}
      className={cn(
        "data-[hidden]:hidden [&[hidden]]:hidden [&[inert]:not([data-slide=panel][data-slide-exiting][data-ending-style])]:hidden [&[inert][data-ending-style]]:m-0",
        "not-supports-[anchor-name:--aui-slide-panel]:[&[inert]]:hidden not-supports-[anchor-scope:--aui-slide-panel]:[&[inert]]:hidden",
        className,
      )}
      {...props}
    />
  );
}
