import type { ComponentProps, CSSProperties } from "react";
import type { TableKnobStyle } from "@/components/control-ui/knob-contracts/table-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type TableProps = Omit<ComponentProps<"table">, "style"> & { style?: CSSProperties & TableKnobStyle };

export type TableHeaderProps = Omit<ComponentProps<"thead">, "style"> & { style?: CSSProperties & TableKnobStyle };

export type TableBodyProps = Omit<ComponentProps<"tbody">, "style"> & { style?: CSSProperties & TableKnobStyle };

export type TableFooterProps = Omit<ComponentProps<"tfoot">, "style"> & { style?: CSSProperties & TableKnobStyle };

export type TableRowProps = Omit<ComponentProps<"tr">, "style"> & { style?: CSSProperties & TableKnobStyle };

export type TableHeadProps = Omit<ComponentProps<"th">, "style"> & { style?: CSSProperties & TableKnobStyle };

export type TableCellProps = ComponentProps<"td"> & { style?: CSSProperties & TableKnobStyle };

export type TableCaptionProps = Omit<ComponentProps<"caption">, "style"> & { style?: CSSProperties & TableKnobStyle };

// wrapped in overflow-x-auto so wide tables scroll instead of blowing out layout
export function Table({ className, ...props }: TableProps) {
  return (
    <div data-control-ui="table" data-control-family="table" data-slot="container" className="relative w-full overflow-x-auto">
      <table
        data-control-ui="table"
        data-control-family="table"
        data-slot="root"
        className={cn("w-full caption-bottom", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead data-control-ui="table" data-control-family="table" data-slot="header" className={className} {...props} />;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody data-control-ui="table" data-control-family="table" data-slot="body" className={className} {...props} />;
}

export function TableFooter({ className, ...props }: TableFooterProps) {
  return <tfoot data-control-ui="table" data-control-family="table" data-slot="footer" className={className} {...props} />;
}

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr data-control-ui="table" data-control-family="table" data-slot="row" className={className} {...props} />;
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-control-ui="table"
      data-control-family="table"
      data-slot="head"
      className={cn("h-10 whitespace-nowrap px-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-control-ui="table"
      data-control-family="table"
      data-slot="cell"
      className={cn("whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: TableCaptionProps) {
  return <caption data-control-ui="table" data-control-family="table" data-slot="caption" className={cn("mt-4", className)} {...props} />;
}
