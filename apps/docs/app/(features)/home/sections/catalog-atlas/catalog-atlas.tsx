import { componentCategories, componentCount, countWord, kitCount, templateCount } from "@/app/(features)/home/home-content";
import { SectionLead } from "@/app/(features)/home/shared/section-header";
import { AtlasExplorer } from "./atlas-explorer";
import { DiffHeading } from "./diff-heading";

const NAMED_IN_HEADING = 6;

export function CatalogAtlas() {
  return (
    <section id="catalog-atlas" aria-labelledby="catalog-atlas-title" className="grid min-w-0 scroll-mt-20 gap-10 @3xl/home:gap-14">
      <header className="flex min-w-0 flex-col gap-6 @4xl/home:flex-row @4xl/home:flex-wrap @4xl/home:items-end @4xl/home:justify-between @4xl/home:gap-12">
        <DiffHeading id="catalog-atlas-title" remaining={componentCount - NAMED_IN_HEADING} />
        <SectionLead link={{ href: "/components", label: `Browse all ${componentCount}` }}>
          {componentCount} components in {countWord(componentCategories.length)} categories, from a button to a console mixer. Each one
          lands as source in your repo, where you and your agent can read it.
        </SectionLead>
      </header>
      <AtlasExplorer categories={componentCategories} kitCount={kitCount} templateCount={templateCount} />
    </section>
  );
}
