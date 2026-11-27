import type { ReactNode } from "react";
import { IntentLink } from "@/app/(features)/client/intent-link";
import { annotationTagClassName } from "@/app/(features)/home/shared/annotation-tag";
import { cn } from "@/components/control-ui/lib/cn";
import { Heading, Text } from "@/components/control-ui/ui/typography";

function DiffLine({ number, added = false, children }: { number: number; added?: boolean; children: ReactNode }) {
  return (
    <span className={cn("flex items-center px-4.5 py-2.5", added && "bg-(--diff-add-line)")}>
      <span aria-hidden="true" className="flex shrink-0 items-center text-muted-foreground">
        <Text size="label" mono numeric className="w-6.5">
          {number}
        </Text>
        <Text size="body-lg" mono tone={added ? "success" : "muted"} className="w-7.5 text-center">
          {added ? "+" : ""}
        </Text>
      </span>
      <span className={cn("min-w-0 @3xl/home:whitespace-nowrap", added ? "text-(--diff-add-fg)" : "text-muted-foreground")}>
        {children}
      </span>
    </span>
  );
}

function Added({ children }: { children: ReactNode }) {
  return <span className="rounded-sm bg-(--diff-add-emphasis) box-decoration-clone px-0.5">{children}</span>;
}

export function DiffHeading({ id, remaining }: { id: string; remaining: number }) {
  return (
    <div className="relative mt-5.5 w-fit max-w-full">
      <IntentLink
        href="/components/code-diff"
        className={cn(
          annotationTagClassName,
          "absolute bottom-full left-0 rounded-b-none outline-none transition-opacity duration-(--duration-fast) ease-(--ease-standard) hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <Text size="caption" weight="medium" mono>
          CodeDiff
        </Text>
      </IntentLink>
      <div className="rounded-[calc(var(--radius)*2.1)] rounded-tl-none border-[1.5px] border-info p-1.5">
        <div className="overflow-hidden rounded-xl border border-border bg-card [zoom:0.7] @3xl/home:[zoom:1.3]">
          <div aria-hidden="true" className="flex items-center justify-between border-border border-b px-4.5 py-2.5">
            <Text size="label" mono tone="muted">
              catalog.ts
            </Text>
            <Text size="label" mono tone="success">
              +2
            </Text>
          </div>
          <div className="py-2">
            <Heading level={2} id={id} size="display" weight="normal" mono className="grid">
              <DiffLine number={12}>button, dialog, dropdown,</DiffLine>
              <DiffLine number={13} added>
                <Added>mixer strip</Added>, <Added>node graph</Added>,
              </DiffLine>
              <DiffLine number={14} added>
                <Added>infinite canvas</Added>, {remaining} more.
              </DiffLine>
            </Heading>
          </div>
        </div>
      </div>
    </div>
  );
}
