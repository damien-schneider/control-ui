import Link from "next/link";
import { referenceOverview } from "@/app/(features)/catalog/guides";
import { docsPageForPath } from "@/app/(features)/catalog/pages";
import { getDocsData } from "@/app/(features)/model/data";
import { guideNavSections } from "@/app/(features)/sidebar/nav-items";
import { Card } from "@/components/control-ui/ui/card";
import { Heading, Text } from "@/components/control-ui/ui/typography";

export function ReferencePage() {
  const sections = guideNavSections(getDocsData().guides).reference.map((group) => ({
    id: group.id,
    title: group.title,
    entries: group.items.flatMap((item) => {
      const page = docsPageForPath(`/${item.id}`);
      return page ? [page] : [];
    }),
  }));

  return (
    <section className="docs-article">
      <Text as="div" size="caption" weight="medium" tone="muted">
        Docs
      </Text>
      <Heading level={1} size="display" className="mt-2">
        {referenceOverview.name}
      </Heading>
      <Text as="p" size="body-lg" tone="muted" className="mt-3 text-pretty">
        {referenceOverview.summary}
      </Text>

      <div className="mt-10 grid min-w-0 gap-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="min-w-0 scroll-mt-20">
            <Heading level={2}>{section.title}</Heading>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {section.entries.map((entry) => (
                <Link key={entry.id} href={entry.href} className="group block min-w-0">
                  <Card className="h-full gap-1.5 px-4 py-3 transition-colors group-hover:bg-sidebar-accent">
                    <Text size="label" weight="medium" className="group-hover:underline group-hover:underline-offset-4">
                      {entry.name}
                    </Text>
                    <Text as="p" tone="muted" className="leading-6">
                      {entry.summary}
                    </Text>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
