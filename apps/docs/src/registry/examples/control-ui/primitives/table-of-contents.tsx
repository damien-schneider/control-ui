"use client";

import type { TocItem } from "@/components/control-ui/ui/table-of-contents";
import { TableOfContents } from "@/components/control-ui/ui/table-of-contents";

type ExampleSection = Omit<TocItem, "children" | "level"> & {
  body: string;
  level: 2 | 3 | 4;
  children?: ExampleSection[];
};

const sections = [
  {
    href: "#toc-example-installation",
    label: "Installation",
    level: 2,
    body: "Add the component with the registry CLI, or copy the source when the project keeps its own primitives.",
    children: [
      {
        href: "#toc-example-prerequisites",
        label: "Prerequisites",
        level: 3,
        body: "The project needs Tailwind CSS v4 and the shared theme tokens before any component renders correctly.",
      },
      {
        href: "#toc-example-steps",
        label: "Installation steps",
        level: 3,
        body: "Run the install command, import the recipe stylesheet once, and wrap the app in a skin.",
      },
    ],
  },
  {
    href: "#toc-example-configuration",
    label: "Configuration",
    level: 2,
    body: "Every visual decision is a knob, so a skin can restyle the component without touching its markup.",
    children: [
      {
        href: "#toc-example-knobs",
        label: "Knobs",
        level: 3,
        body: "Knobs are registered custom properties with typed initial values and inheritance.",
        children: [
          {
            href: "#toc-example-colors",
            label: "Colors",
            level: 4,
            body: "Author colors in oklch and derive states with relative color syntax.",
          },
          {
            href: "#toc-example-motion",
            label: "Motion",
            level: 4,
            body: "Durations come from shared tokens, so reduced-motion settings apply everywhere at once.",
          },
        ],
      },
      {
        href: "#toc-example-skins",
        label: "Skins",
        level: 3,
        body: "A skin groups knob values under a data attribute and can be swapped at runtime.",
      },
    ],
  },
  {
    href: "#toc-example-usage",
    label: "Usage",
    level: 2,
    body: "Pass items whose hrefs match the heading IDs in the document; the navigation tracks them while scrolling.",
    children: [
      {
        href: "#toc-example-indicator",
        label: "Custom indicator",
        level: 3,
        body: "Any node passed as indicator travels along the rail to the section being read.",
      },
    ],
  },
] satisfies ExampleSection[];

const tocKnobs = { "--cui-table-of-contents-padding": "calc(var(--spacing) * 3)" };

export function PrimitiveTableOfContentsExample() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-[minmax(0,1fr)_12rem_12rem] gap-5 max-md:grid-cols-1">
      <article className="h-96 overflow-y-auto scroll-smooth rounded-xl border bg-background p-5">
        {sections.map((section) => (
          <PreviewSection key={section.href} section={section} />
        ))}
      </article>
      <TableOfContents items={sections} label="Range" className="static h-fit max-md:hidden" style={tocKnobs} />
      <TableOfContents
        items={sections}
        label="Progress"
        variant="progress"
        indicator={<span className="size-2.5 rounded-full border-2 border-current bg-background" />}
        className="static h-fit max-md:hidden"
        style={tocKnobs}
      />
    </div>
  );
}

function PreviewSection({ section }: { section: ExampleSection }) {
  return (
    <section id={section.href.slice(1)} className="scroll-mt-4 pb-8 last:pb-24">
      <SectionHeading level={section.level}>{section.label}</SectionHeading>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
      {section.children ? (
        <div className={section.level === 2 ? "mt-6 grid gap-5" : "mt-4 grid gap-4"}>
          {section.children.map((child) => (
            <PreviewSection key={child.href} section={child} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SectionHeading({ level, children }: { level: ExampleSection["level"]; children: string }) {
  if (level === 2) return <h2 className="text-xl font-semibold tracking-tight text-foreground">{children}</h2>;
  if (level === 3) return <h3 className="text-base font-semibold text-foreground">{children}</h3>;
  return <h4 className="text-sm font-medium text-foreground">{children}</h4>;
}
