import { ChevronRightIcon } from "lucide-react";
import { IntentLink } from "@/app/(features)/client/intent-link";
import type { ComponentCategory, ComponentItem } from "@/app/(features)/home/home-content";
import { ArrowLink } from "@/app/(features)/home/shared/arrow-link";
import { cn } from "@/components/control-ui/lib/cn";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { atlasFeaturedIds } from "./atlas-layout";
import { type IndexGroup, packIndexColumns } from "./index-columns";

const MOBILE_HIGHLIGHTS = 4;

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function InViewDot({ active = true }: { active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-1.5 shrink-0 rounded-full bg-info transition-transform duration-(--duration-base) ease-(--ease-emphasized)",
        active ? "scale-100" : "scale-0",
      )}
    />
  );
}

function IndexLink({ item, inView }: { item: ComponentItem; inView: boolean }) {
  return (
    <IntentLink
      href={item.href}
      className={cn(
        "inline-flex min-h-6 max-w-full items-center gap-2 rounded-sm transition-colors duration-(--duration-fast) ease-(--ease-standard) hover:text-foreground",
        focusRing,
        inView ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <Text size="label" weight={inView ? "medium" : "normal"} className="truncate">
        {item.name}
      </Text>
      <InViewDot active={inView} />
    </IntentLink>
  );
}

function IndexColumnGroup({ group, inView }: { group: IndexGroup; inView: ReadonlySet<string> }) {
  const { category, items, continued } = group;

  return (
    <div className="grid min-w-0 content-start gap-3.5">
      <div aria-hidden={continued || undefined} className="flex items-baseline gap-2 border-border border-b pb-2.5">
        {continued ? (
          <Text size="label">&nbsp;</Text>
        ) : (
          <>
            <Heading level={3} size="label" weight="medium" tone="foreground">
              {category.title}
            </Heading>
            <Text size="caption" tone="muted" numeric>
              {category.items.length}
            </Text>
          </>
        )}
      </div>
      <ul className="grid min-w-0 justify-items-start">
        {items.map((item) => (
          <li key={item.id} className="max-w-full">
            <IndexLink item={item} inView={inView.has(item.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryRow({ category }: { category: ComponentCategory }) {
  const highlights = category.items
    .toSorted((a, b) => Number(atlasFeaturedIds.includes(b.id)) - Number(atlasFeaturedIds.includes(a.id)))
    .slice(0, MOBILE_HIGHLIGHTS)
    .map((item) => item.name);

  return (
    <li className="border-border border-b">
      <IntentLink
        href={`/components#${category.id}`}
        className={cn("flex min-h-16 items-center justify-between gap-4 py-3 text-muted-foreground", focusRing)}
      >
        <span className="grid min-w-0 gap-0.5">
          <span className="flex items-baseline gap-2">
            <Heading level={3} size="body-lg" weight="medium" tone="foreground">
              {category.title}
            </Heading>
            <Text size="caption" numeric>
              {category.items.length}
            </Text>
          </span>
          <Text size="body">{highlights.join(" · ")}</Text>
        </span>
        <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0" />
      </IntentLink>
    </li>
  );
}

export function AtlasIndex({
  categories,
  inView,
  kitCount,
  templateCount,
}: {
  categories: readonly ComponentCategory[];
  inView: ReadonlySet<string>;
  kitCount: number;
  templateCount: number;
}) {
  const columns = packIndexColumns(categories);

  return (
    <nav aria-label="Component index" className="grid min-w-0 gap-5 @5xl/home:gap-8">
      <div className="hidden grid-flow-col auto-cols-fr gap-x-5 @5xl/home:grid">
        {columns.map((column) => (
          <div
            key={column.map((group) => `${group.category.id}-${group.items[0]?.id}`).join()}
            className="grid min-w-0 content-start gap-8"
          >
            {column.map((group) => (
              <IndexColumnGroup key={`${group.category.id}-${group.items[0]?.id}`} group={group} inView={inView} />
            ))}
          </div>
        ))}
      </div>
      <ul className="border-border border-t @5xl/home:hidden">
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-x-2 @5xl/home:justify-end">
        <Text size="label" tone="muted">
          Then, built from these:
        </Text>
        <ArrowLink href="#agent-workspace" direction="down">
          {kitCount} kits, {templateCount} templates
        </ArrowLink>
      </div>
    </nav>
  );
}
