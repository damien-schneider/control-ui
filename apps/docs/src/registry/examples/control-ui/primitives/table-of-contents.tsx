"use client";

import type { TocItem } from "@/components/control-ui/contracts";
import { TableOfContents } from "@/components/control-ui/ui/table-of-contents";

type ExampleSection = Omit<TocItem, "children" | "level"> & {
  body: string;
  level: 1 | 2 | 3;
  children?: ExampleSection[];
};

const sections = [
  {
    href: "#toc-example-agent-surface",
    label: "Agent surface",
    level: 1,
    body: "A product page can expose the same registry, examples, and installation paths to people and coding agents.",
    children: [
      {
        href: "#toc-example-discovery",
        label: "Discovery",
        level: 2,
        body: "The registry index keeps search, install commands, source previews, and generated agent docs aligned.",
        children: [
          {
            href: "#toc-example-api",
            label: "HTTP API",
            level: 3,
            body: "Each component has a stable endpoint for source files, dependencies, and install metadata.",
          },
          {
            href: "#toc-example-cli",
            label: "CLI",
            level: 3,
            body: "The command line mirrors the same catalog so automation does not need a separate contract.",
          },
        ],
      },
      {
        href: "#toc-example-composition",
        label: "Composition",
        level: 2,
        body: "Blocks compose installable primitives without taking ownership of runner, transport, or persistence logic.",
        children: [
          {
            href: "#toc-example-overrides",
            label: "Overrides",
            level: 3,
            body: "Teams can keep the generated source and reshape the markup where their workflow needs it.",
          },
        ],
      },
    ],
  },
  {
    href: "#toc-example-release",
    label: "Release notes",
    level: 1,
    body: "Long documentation pages stay scannable when the navigation reflects real document hierarchy.",
    children: [
      {
        href: "#toc-example-changelog",
        label: "Changelog",
        level: 2,
        body: "Nested headings remain plain anchors, so browser history and copy-link behavior keep working.",
      },
    ],
  },
] satisfies ExampleSection[];

export function PrimitiveTableOfContentsExample() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-[minmax(0,1fr)_13rem] gap-5 max-sm:grid-cols-1">
      <article className="h-80 overflow-y-auto scroll-smooth rounded-xl border bg-background p-5">
        {sections.map((section) => (
          <PreviewSection key={section.href} section={section} />
        ))}
      </article>
      <div className="grid h-80 gap-3 overflow-y-auto pr-1 max-sm:hidden">
        <TableOfContents items={sections} label="Trail" variant="trail" className="static top-0 h-fit rounded-xl p-3 text-xs" />
        <TableOfContents items={sections} label="Background" variant="background" className="static top-0 h-fit rounded-xl p-3 text-xs" />
        <TableOfContents items={sections} label="Both" variant="both" className="static top-0 h-fit rounded-xl p-3 text-xs" />
      </div>
    </div>
  );
}

function PreviewSection({ section }: { section: ExampleSection }) {
  return (
    <section id={section.href.slice(1)} className="scroll-mt-4 pb-8 last:pb-24">
      <SectionHeading level={section.level}>{section.label}</SectionHeading>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
      {section.children ? (
        <div className={section.level === 1 ? "mt-6 grid gap-5" : "mt-4 grid gap-4"}>
          {section.children.map((child) => (
            <PreviewSection key={child.href} section={child} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SectionHeading({ level, children }: { level: ExampleSection["level"]; children: string }) {
  if (level === 1) return <h1 className="text-xl font-semibold tracking-tight text-foreground">{children}</h1>;
  if (level === 2) return <h2 className="text-base font-semibold text-foreground">{children}</h2>;
  return <h3 className="text-sm font-medium text-foreground">{children}</h3>;
}
