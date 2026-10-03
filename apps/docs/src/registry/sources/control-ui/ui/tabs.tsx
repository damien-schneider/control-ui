"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react";
import { Children, createContext, Fragment, isValidElement, useContext, useEffect, useRef, useState } from "react";
import type { ControlledChoice, RenderProp } from "@/components/control-ui/control-props";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { TabsKnobStyle } from "@/components/control-ui/knob-contracts/tabs-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type TabsProps<TValue extends string = string> = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledChoice<TValue> & { orientation?: "horizontal" | "vertical"; style?: CSSProperties & TabsKnobStyle };

export type TabsListVariant = "default" | "browser";

export type TabsListProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & TabsKnobStyle } & {
  size?: ControlSize;
  variant?: TabsListVariant;
  activateOnFocus?: boolean;
  loopFocus?: boolean;
};

export type TabsTabProps = Omit<Omit<ComponentProps<"button">, "value">, "style"> & { style?: CSSProperties & TabsKnobStyle } & {
  value: string;
  render?: RenderProp<ComponentProps<"button">, { active: boolean; disabled: boolean }>;
  nativeButton?: boolean;
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

type TabsPanelsContextValue = { registerPanel: RegisterTabsPanel; exitingValue: string | null };

function refreshTabsPanelHeight(panel: ActiveTabsPanel) {
  if (panel.node.inert || panel.node.hidden) return;
  panel.height = panel.node.getBoundingClientRect().height;
}

const TabsPanelsContext = createContext<TabsPanelsContextValue | null>(null);

function useTabsPanels() {
  const context = useContext(TabsPanelsContext);
  if (!context) throw new Error("TabsPanel must be rendered inside <Tabs>.");
  return context;
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") return ref(value);
  if (ref) ref.current = value;
}

export function Tabs<TValue extends string = string>({ className, onValueChange, children, ...props }: TabsProps<TValue>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const activePanelRef = useRef<ActiveTabsPanel | null>(null);
  const clearPreviousHeightFrame = useRef(0);
  const [exitingValue, setExitingValue] = useState<string | null>(null);
  const [holdPreviousHeight] = useState(() => (height: string) => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty("--aui-slide-prev-height", height);
    cancelAnimationFrame(clearPreviousHeightFrame.current);
    clearPreviousHeightFrame.current = requestAnimationFrame(() => {
      clearPreviousHeightFrame.current = requestAnimationFrame(() => {
        root.style.removeProperty("--aui-slide-prev-height");
        root.removeAttribute("data-slide-starting");
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
      root.setAttribute("data-slide-starting", "");
      holdPreviousHeight(root.style.getPropertyValue("--aui-slide-prev-height") || `${previousPanel.height}px`);
      setExitingValue(previousPanel.value);
    }
    activePanelRef.current = { value, node, height: node.getBoundingClientRect().height };
    if (root) {
      root.style.setProperty("--_tabs-panel-top", `${node.offsetTop}px`);
      root.style.setProperty("--_tabs-panel-left", `${node.offsetLeft}px`);
      root.style.setProperty("--_tabs-panel-width", `${node.offsetWidth}px`);
      root.style.setProperty("--_tabs-panel-height", `${node.offsetHeight}px`);
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
    <TabsPanelsContext.Provider value={{ registerPanel, exitingValue }}>
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
    </TabsPanelsContext.Provider>
  );
}

const controlHeights: Record<ControlSize, string> = {
  xs: "var(--control-h-xs)",
  sm: "var(--control-h-sm)",
  md: "var(--control-h-md)",
  lg: "var(--control-h-lg)",
};

type TabsListStyle = CSSProperties & {
  "--_tabs-trigger-h"?: string;
};

function countTabs(children: ReactNode): number {
  return Children.toArray(children).reduce<number>((count, child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return count;
    if (child.type === TabsTab) return count + 1;
    if (child.type === Fragment) return count + countTabs(child.props.children);
    return count;
  }, 0);
}

export function TabsList({ size = "sm", variant = "default", className, children, style, ...props }: TabsListProps) {
  const isSingle = countTabs(children) === 1;
  const controlStyle = {
    "--_tabs-trigger-h": controlHeights[size],
    ...style,
  } satisfies TabsListStyle;

  return (
    <TabsPrimitive.List
      data-control-ui="tabs"
      data-control-family="tabs"
      data-slot="list"
      data-size={size}
      data-variant={variant}
      data-single={isSingle ? "true" : undefined}
      className={cn(variant === "browser" && "gap-0 p-0 px-(--_tabs-browser-inset) pt-(--cui-tabs-list-padding)", className)}
      style={controlStyle}
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
              ? "top-auto bottom-0 left-(--_tabs-browser-indicator-x) z-0 h-(--_tabs-trigger-h) w-(--_tabs-browser-indicator-width) transform-none"
              : undefined
          }
        />
      )}
    </TabsPrimitive.List>
  );
}

export function TabsTab({ className, ...props }: TabsTabProps) {
  return <TabsPrimitive.Tab data-control-ui="tabs" data-control-family="tabs" data-slot="tab" className={className} {...props} />;
}

export function TabsPanel({ className, value, ref, ...props }: TabsPanelProps) {
  const { registerPanel, exitingValue } = useTabsPanels();
  const panelRef = (node: HTMLDivElement | null) => {
    const unregister = registerPanel(value, node);
    const cleanup = setRef(ref, node);
    if (!node) return;
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
