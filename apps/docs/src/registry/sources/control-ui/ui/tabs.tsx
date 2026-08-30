"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react";
import { Children, createContext, Fragment, isValidElement, useContext, useRef, useState } from "react";
import type { ControlledChoice, RenderProp } from "@/components/control-ui/control-props";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { TabsKnobStyle } from "@/components/control-ui/knob-contracts/tabs-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type TabsProps<TValue extends string = string> = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledChoice<TValue> & { style?: CSSProperties & TabsKnobStyle };

export type TabsListVariant = "default" | "browser";

export type TabsListProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & TabsKnobStyle } & {
  size?: ControlSize;
  variant?: TabsListVariant;
};

export type TabsTabProps = Omit<Omit<ComponentProps<"button">, "value">, "style"> & { style?: CSSProperties & TabsKnobStyle } & {
  value: string;
  render?: RenderProp<ComponentProps<"button">, { active: boolean; disabled: boolean }>;
  nativeButton?: boolean;
};

export type TabsPanelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & TabsKnobStyle } & {
  value: string;
};

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

// rides Base UI's --active-tab-width/--active-tab-left, so one transition slides it between tabs
export function Tabs<TValue extends string = string>({ className, onValueChange, children, ...props }: TabsProps<TValue>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef(new Map<string, HTMLDivElement>());
  const clearPrevHeight = useRef(0);
  const [registerPanel] = useState<RegisterTabsPanel>(() => (value: string, node: HTMLDivElement | null) => {
    if (!node) return;
    panelsRef.current.set(value, node);
    return () => {
      if (panelsRef.current.get(value) === node) panelsRef.current.delete(value);
    };
  });

  // Captured height bridges CSS's auto-to-auto transition gap.
  const handleValueChange = (value: TValue) => {
    const root = rootRef.current;
    if (root) {
      for (const panel of panelsRef.current.values()) {
        if (panel.inert || panel.hidden) continue;
        root.style.setProperty("--aui-slide-prev-height", `${panel.getBoundingClientRect().height}px`);
        cancelAnimationFrame(clearPrevHeight.current);
        clearPrevHeight.current = requestAnimationFrame(() => {
          clearPrevHeight.current = requestAnimationFrame(() => root.style.removeProperty("--aui-slide-prev-height"));
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
      data-control-family="tabs"
      data-slot="panel"
      data-slide="panel"
      className={cn("data-[hidden]:hidden [&[hidden]]:hidden", className)}
      {...props}
    />
  );
}
