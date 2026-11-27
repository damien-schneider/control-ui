import { IntentLink } from "@/app/(features)/client/intent-link";
import { annotationTagClassName } from "@/app/(features)/home/shared/annotation-tag";
import { cn } from "@/components/control-ui/lib/cn";
import { CodeDiff } from "@/components/control-ui/ui/code-diff";
import { Heading, Text } from "@/components/control-ui/ui/typography";

const shippedBefore = "button, dialog, dropdown,";

function shippedNow(remaining: number) {
  return [shippedBefore, "mixer strip, node graph,", `infinite canvas, ${remaining} more.`];
}

function catalogPatch(lines: readonly string[]) {
  const [unchanged, ...added] = lines;
  return [
    "--- a/catalog.ts",
    "+++ b/catalog.ts",
    `@@ -12,1 +12,${lines.length} @@`,
    ` ${unchanged}`,
    ...added.map((line) => `+${line}`),
    "",
  ].join("\n");
}

export function DiffHeading({ id, remaining }: { id: string; remaining: number }) {
  const lines = shippedNow(remaining);

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
      <Heading level={2} id={id} className="sr-only">
        {lines.join(" ")}
      </Heading>
      <div aria-hidden="true" inert className="rounded-[calc(var(--radius)*2.1)] rounded-tl-none border-[1.5px] border-info p-1.5">
        <div className="[zoom:1.4] @3xl/home:[zoom:2]">
          <CodeDiff patch={catalogPatch(lines)} diffStyle="unified" diffIndicators="classic" overflow="wrap" maxHeight="none" />
        </div>
      </div>
    </div>
  );
}
