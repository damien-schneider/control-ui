import type { ReactNode } from "react";
import type { PreviewLayout } from "@/app/(features)/catalog/shared";

const layouts = {
  full: "flex w-full min-w-0 flex-col items-center",
  centered: "flex w-full min-w-0 justify-center",
  stack: "flex w-full max-w-64 min-w-0 flex-col gap-3",
  grid: "grid w-full max-w-md min-w-0 grid-cols-2 gap-4",
  contained: "h-104 w-full min-w-0 overflow-hidden rounded-xl border",
} satisfies Record<PreviewLayout, string>;

export function PreviewFrame({ layout, children }: { layout?: PreviewLayout; children: ReactNode }) {
  if (!layout) return children;

  return (
    <div data-preview-layout={layout} className={layouts[layout]}>
      {children}
    </div>
  );
}
