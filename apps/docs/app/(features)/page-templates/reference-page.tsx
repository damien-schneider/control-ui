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
    <section className="mx-auto min-w-0 w-full max-w-4xl px-5 py-12">
      <div className="max-w-2xl">
        <div className="text-caption font-medium text-muted-foreground">Docs</div>
        <h1 className="mt-2 text-display font-display">{referenceOverview.name}</h1>
        <p className="mt-3 text-body-lg text-muted-foreground">{referenceOverview.summary}</p>
      </div>

      <div className="mt-10 grid min-w-0 gap-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="min-w-0 scroll-mt-20">
            <h2 className="max-w-2xl text-heading-2 font-display">{section.title}</h2>
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
