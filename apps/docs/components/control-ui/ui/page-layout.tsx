"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { PageLayoutKnobStyle } from "@/components/control-ui/knob-contracts/page-layout-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";
import { ScrollArea, type ScrollAreaProps } from "@/components/control-ui/ui/scroll-area";

export const pageWidths = ["prose", "content", "wide", "full"] as const;
export type PageWidth = (typeof pageWidths)[number];

export const pageScrollModes = ["page", "inset", "none"] as const;
export type PageScrollMode = (typeof pageScrollModes)[number];
export type PageScroll = PageScrollMode | "auto";

export const pageHeaderVariants = ["flow", "sticky", "floating"] as const;
export type PageHeaderVariant = (typeof pageHeaderVariants)[number];

type PageStyle = CSSProperties & PageLayoutKnobStyle;

export function usePageScroll(scroll: PageScroll = "auto"): PageScrollMode {
  const skin = useSkin();
  if (scroll !== "auto") return scroll;
  return skin.sidebarLayout === "page" ? "page" : "inset";
}

export type PageLayoutProps = Omit<ComponentProps<"div">, "style"> & {
  scroll?: PageScroll;
  width?: PageWidth;
  scrollViewportRef?: ScrollAreaProps["viewportRef"];
  style?: PageStyle;
};

export function PageLayout({ scroll = "auto", width = "prose", scrollViewportRef, children, className, ...props }: PageLayoutProps) {
  const resolvedScroll = usePageScroll(scroll);
  const scrollsInset = resolvedScroll === "inset";

  return (
    <div
      data-control-ui="page-layout"
      data-control-family="page-layout"
      data-slot="root"
      data-scroll={resolvedScroll}
      data-width={width}
      className={cn("flex w-full flex-col", resolvedScroll !== "page" && "min-h-0 flex-1 overflow-hidden", className)}
      {...props}
    >
      {scrollsInset ? (
        <ScrollArea
          className="min-h-0 flex-1"
          viewportClassName="scroll-smooth motion-reduce:scroll-auto"
          viewportRef={scrollViewportRef}
          lockAxis="x"
        >
          {children}
        </ScrollArea>
      ) : (
        children
      )}
    </div>
  );
}

export type PageHeaderProps = Omit<ComponentProps<"header">, "style"> & {
  variant?: PageHeaderVariant;
  style?: PageStyle;
};

export function PageHeader({ variant = "flow", className, ...props }: PageHeaderProps) {
  return (
    <header
      data-control-ui="page-layout"
      data-control-family="page-layout"
      data-slot="header"
      data-variant={variant}
      className={className}
      {...props}
    />
  );
}

export type PageTitleProps = Omit<ComponentProps<"h1">, "style"> & { style?: PageStyle };

export function PageTitle({ className, ...props }: PageTitleProps) {
  return (
    <h1
      data-control-ui="page-layout"
      data-control-family="page-layout"
      data-slot="title"
      className={cn("text-balance", className)}
      {...props}
    />
  );
}

export type PageDescriptionProps = Omit<ComponentProps<"p">, "style"> & { style?: PageStyle };

export function PageDescription({ className, ...props }: PageDescriptionProps) {
  return (
    <p
      data-control-ui="page-layout"
      data-control-family="page-layout"
      data-slot="description"
      className={cn("text-pretty", className)}
      {...props}
    />
  );
}

export type PageActionsProps = Omit<ComponentProps<"div">, "style"> & { style?: PageStyle };

export function PageActions({ className, ...props }: PageActionsProps) {
  return (
    <div
      data-control-ui="page-layout"
      data-control-family="page-layout"
      data-slot="actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

export type PageBodyProps = Omit<ComponentProps<"div">, "style"> & {
  aside?: ReactNode;
  contentClassName?: string;
  style?: PageStyle;
};

export function PageBody({ aside, contentClassName, children, className, ...props }: PageBodyProps) {
  return (
    <div
      data-control-ui="page-layout"
      data-control-family="page-layout"
      data-slot="body"
      data-aside={aside ? "" : undefined}
      className={className}
      {...props}
    >
      <div data-control-ui="page-layout" data-control-family="page-layout" data-slot="content" className={cn("min-w-0", contentClassName)}>
        {children}
      </div>
      {aside ? (
        <aside data-control-ui="page-layout" data-control-family="page-layout" data-slot="aside">
          {aside}
        </aside>
      ) : null}
    </div>
  );
}
