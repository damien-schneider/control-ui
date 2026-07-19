"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import type { CSSProperties, ReactNode, Ref } from "react";
import { Children, createContext, Fragment, isValidElement, useContext, useRef } from "react";
import type { ControlSize, TabsListProps, TabsPanelProps, TabsProps, TabsTabProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

type RegisterTabsPanel = (value: string, node: HTMLDivElement | null) => (() => void) | undefined;

const TabsPanelsContext = createContext<RegisterTabsPanel | null>(null);

function useRegisterTabsPanel() {
  const registerPanel = useContext(TabsPanelsContext);
  if (!registerPanel) throw new Error("TabsPanel must be rendered inside <Tabs>.");
  return registerPanel;
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") return ref(value);
  if (ref) ref.current = value;
}

// Active indicator driven by Base UI's --active-tab-width/--active-tab-left — slides between tabs with one transition.
export function Tabs({ className, onValueChange, children, ...props }: TabsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef(new Map<string, HTMLDivElement>());
  const clearPrevHeight = useRef(0);
  const registerPanel: RegisterTabsPanel = (value, node) => {
    if (!node) return;
    panelsRef.current.set(value, node);
    return () => {
      if (panelsRef.current.get(value) === node) panelsRef.current.delete(value);
    };
  };

  // The cross-slide's height morph needs the outgoing panel's height as the entering panel's starting
  // height — auto→auto never transitions, and CSS cannot measure a sibling. Captured here pre-commit
  // (the active panel is still the old one), cleared right after the starting frame so a later switch
  // that skips onValueChange (externally controlled value) never morphs from a stale height.
  const handleValueChange = (value: string) => {
    const root = rootRef.current;
    if (root) {
      for (const panel of panelsRef.current.values()) {
        if (panel.inert || panel.hidden) continue;
        root.style.setProperty("--aui-tabs-prev-height", `${panel.getBoundingClientRect().height}px`);
        cancelAnimationFrame(clearPrevHeight.current);
        clearPrevHeight.current = requestAnimationFrame(() => {
          clearPrevHeight.current = requestAnimationFrame(() => root.style.removeProperty("--aui-tabs-prev-height"));
        });
        break;
      }
    }
    onValueChange?.(value);
  };

  return (
    <TabsPanelsContext.Provider value={registerPanel}>
      <TabsPrimitive.Root
        data-control-ui="tabs"
        data-slot="root"
        className={cn(skinSlot("tabs", "root", {}), className)}
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
  "--tabs-trigger-h"?: string;
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
    "--tabs-trigger-h": controlHeights[size],
    ...style,
  } satisfies TabsListStyle;

  return (
    <TabsPrimitive.List
      data-control-ui="tabs"
      data-slot="list"
      data-size={size}
      data-variant={variant}
      data-single={isSingle ? "true" : undefined}
      className={cn(
        "group/tabs-list",
        skinSlot("tabs", "list", { size, variant }),
        variant === "browser" && "gap-0 rounded-b-none p-0 px-(--tabs-trigger-radius-fit) pt-(--tabs-list-padding)",
        className,
      )}
      style={controlStyle}
      {...props}
    >
      {children}
      {isSingle ? null : (
        <TabsPrimitive.Indicator
          data-control-ui="tabs"
          data-slot="indicator"
          className={cn(
            skinSlot("tabs", "indicator", {}),
            variant === "browser" &&
              "top-auto bottom-0 z-0 h-(--tabs-trigger-h) w-(--tabs-browser-indicator-width) transform-[translateX(var(--tabs-browser-indicator-x))] rounded-none",
          )}
        />
      )}
    </TabsPrimitive.List>
  );
}

export function TabsTab({ className, ...props }: TabsTabProps) {
  return (
    <TabsPrimitive.Tab
      data-control-ui="tabs"
      data-slot="tab"
      className={cn(
        skinSlot("tabs", "tab", {}),
        "group-data-[variant=browser]/tabs-list:rounded-t-[var(--tabs-trigger-radius-fit)] group-data-[variant=browser]/tabs-list:rounded-b-none",
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({ className, value, ref, ...props }: TabsPanelProps) {
  const registerPanel = useRegisterTabsPanel();
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
      data-slot="panel"
      className={cn(
        "outline-none data-[hidden]:hidden focus-visible:ring-2 focus-visible:ring-foreground/20 [&[hidden]]:hidden",
        skinSlot("tabs", "panel", {}),
        className,
      )}
      {...props}
    />
  );
}
