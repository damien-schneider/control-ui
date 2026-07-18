import type {
  TableCaptionProps,
  TableCellProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
  TableSectionProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Plain semantic <table> (no Base UI), wrapped overflow-x-auto so wide tables scroll not burst. Hairlines/text/heads/hover all track theme tokens — no per-skin work.
export function Table({ className, ...props }: TableProps) {
  return (
    <div data-control-ui="table" data-slot="container" className="relative w-full overflow-x-auto">
      <table
        data-control-ui="table"
        data-slot="root"
        className={cn("w-full caption-bottom border-collapse text-body", skinSlot("table", "root", {}), className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: TableSectionProps) {
  return <thead data-control-ui="table" data-slot="header" className={cn("[&_tr]:border-b [&_tr]:border-border", className)} {...props} />;
}

export function TableBody({ className, ...props }: TableSectionProps) {
  return <tbody data-control-ui="table" data-slot="body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableFooter({ className, ...props }: TableSectionProps) {
  return (
    <tfoot
      data-control-ui="table"
      data-slot="footer"
      className={cn("border-t border-border bg-foreground/3 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      data-control-ui="table"
      data-slot="row"
      className={cn("border-b border-border transition-colors hover:bg-foreground/3 data-[state=selected]:bg-foreground/5", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-control-ui="table"
      data-slot="head"
      className={cn(
        "h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-control-ui="table"
      data-slot="cell"
      className={cn("whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption data-control-ui="table" data-slot="caption" className={cn("mt-4 text-body text-muted-foreground", className)} {...props} />
  );
}
