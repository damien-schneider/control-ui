"use client";

import { useRender } from "@base-ui/react/use-render";
import { MenuIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { SidebarMenuButton, type SidebarMenuButtonProps } from "@/components/control-ui/ui/sidebar-menu";
import { useSidebar, useSidebarElements } from "@/components/control-ui/ui/sidebar-provider";

export type SidebarMobileNavProps = Omit<ComponentProps<"nav">, "style"> & {
  variant?: "bar" | "floating";
  style?: CSSProperties & SidebarKnobStyle;
};

export function SidebarMobileNav({
  variant = "bar",
  "aria-label": label = "Mobile navigation",
  className,
  style,
  ...props
}: SidebarMobileNavProps) {
  const { layout } = useSidebar();
  return (
    <div
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="mobile-nav-container"
      data-layout={layout}
      data-variant={variant}
      className="shrink-0 lg:hidden"
      style={style}
    >
      <nav
        {...props}
        aria-label={label}
        data-control-ui="sidebar"
        data-control-family="sidebar"
        data-slot="mobile-nav"
        data-variant={variant}
        className={cn("flex items-center", className)}
      />
    </div>
  );
}

export function SidebarMobileNavItem({ onClick, ...props }: SidebarMenuButtonProps) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuButton
      {...props}
      data-mobile-nav-item=""
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpenMobile(false);
      }}
    />
  );
}

export type SidebarMobileTriggerProps = Omit<ComponentProps<"button">, "style"> & {
  render?: RenderProp<ComponentProps<"button">>;
  style?: CSSProperties & SidebarKnobStyle;
};

export function SidebarMobileTrigger({ render, children, onClick, ref, ...props }: SidebarMobileTriggerProps) {
  const { openMobile, setOpenMobile, sidebarId } = useSidebar();
  const { activeTriggerRef } = useSidebarElements();
  return useRender({
    defaultTagName: "button",
    render,
    ref,
    props: {
      type: "button",
      ...props,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "mobile-trigger",
      "data-mobile-nav-item": "",
      "data-sidebar-trigger": "",
      "aria-haspopup": "dialog",
      "aria-expanded": openMobile,
      "aria-controls": openMobile ? sidebarId : undefined,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        activeTriggerRef.current = event.currentTarget;
        setOpenMobile(!openMobile);
      },
      children: children ?? (
        <>
          <MenuIcon aria-hidden="true" />
          <span>Menu</span>
        </>
      ),
    },
  });
}
