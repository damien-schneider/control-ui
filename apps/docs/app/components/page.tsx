import { catalogOverview } from "@/app/(features)/catalog/overviews";
import { componentGalleryGroups } from "@/app/(features)/model/catalog-gallery";
import { CatalogGalleryPage } from "@/app/(features)/page-templates/catalog-gallery-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

const overview = catalogOverview("components");

export const metadata = metadataForDocsPath(overview.href);

export default function ComponentsPage() {
  return (
    <>
      <DocsPageStructuredData pathname={overview.href} />
      <CatalogGalleryPage label={overview.label} title={overview.name} summary={overview.summary} groups={componentGalleryGroups()} />
    </>
  );
}
