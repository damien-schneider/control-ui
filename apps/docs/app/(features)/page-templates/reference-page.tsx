import Link from "next/link";
import { referenceOverview } from "@/app/(features)/catalog/guides";
import { docsPageForPath } from "@/app/(features)/catalog/pages";
import { getDocsData } from "@/app/(features)/model/data";
import { guideNavSections } from "@/app/(features)/sidebar/nav-items";
import { Card } from "@/components/control-ui/ui/card";

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
      <div className="text-caption font-medium text-muted-foreground">Docs</div>
      <h1 className="mt-2 text-display font-display text-balance">{referenceOverview.name}</h1>
      <p className="mt-3 text-body-lg text-pretty text-muted-foreground">{referenceOverview.summary}</p>

      <div className="mt-10 grid min-w-0 gap-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="min-w-0 scroll-mt-20">
            <h2 className="text-heading-2 font-display text-balance">{section.title}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {section.entries.map((entry) => (
                <Link key={entry.id} href={entry.href} className="group block min-w-0">
                  <Card className="h-full gap-1.5 px-4 py-3 transition-colors group-hover:bg-sidebar-accent">
                    <span className="font-medium text-label group-hover:underline group-hover:underline-offset-4">{entry.name}</span>
                    <p className="text-body leading-6 text-muted-foreground">{entry.summary}</p>
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
