"use client";

import type { ComponentProps, CSSProperties } from "react";
import type { AppShellHeaderKnobStyle } from "@/components/control-ui/knob-contracts/app-shell-header-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { type PageScroll, PageScrollContext, usePageScroll } from "@/components/control-ui/ui/page-layout";
import { SidebarInset, type SidebarInsetProps, SidebarProvider, type SidebarProviderProps } from "@/components/control-ui/ui/sidebar";

export type AppShellProps = SidebarProviderProps & { scroll?: PageScroll };

export function AppShell({ scroll = "auto", layout = "viewport", className, ...props }: AppShellProps) {
  const resolvedScroll = usePageScroll(scroll);
  return (
    <PageScrollContext.Provider value={resolvedScroll}>
      <SidebarProvider
        data-app-shell=""
        data-scroll={resolvedScroll}
        layout={layout}
        className={cn(layout === "viewport" && (resolvedScroll === "page" ? "min-h-dvh" : "h-dvh min-h-0 overflow-hidden"), className)}
        {...props}
      />
    </PageScrollContext.Provider>
  );
}

export function AppShellContent({ className, ...props }: SidebarInsetProps) {
  const scroll = usePageScroll();
  return <SidebarInset data-app-shell-content="" className={cn("min-h-0", scroll !== "page" && "overflow-hidden", className)} {...props} />;
}

export type AppShellHeaderProps = Omit<ComponentProps<"header">, "style"> & {
  style?: CSSProperties & AppShellHeaderKnobStyle;
};

export function AppShellHeader({ className, ...props }: AppShellHeaderProps) {
  return (
    <header
      data-control-ui="app-shell"
      data-control-family="app-shell-header"
      data-slot="root"
      className={cn("sticky top-0 z-30 flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}
