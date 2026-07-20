import { catalogOverview } from "@/app/(features)/catalog/overviews";
import { useCaseGalleryGroups } from "@/app/(features)/model/catalog-gallery";
import { UseCaseGalleryPage } from "@/app/(features)/page-templates/use-case-gallery-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

const overview = catalogOverview("use-cases");

export const metadata = metadataForDocsPath(overview.href);

export default function UseCasesPage() {
  return (
    <>
      <DocsPageStructuredData pathname={overview.href} />
      <UseCaseGalleryPage label={overview.label} title={overview.name} summary={overview.summary} groups={useCaseGalleryGroups()} />
    </>
  );
}
