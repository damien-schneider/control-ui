import { catalogOverview } from "@/app/(features)/catalog/overviews";
import { kitGalleryGroups } from "@/app/(features)/model/catalog-gallery";
import { CatalogGalleryPage } from "@/app/(features)/page-templates/catalog-gallery-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

const overview = catalogOverview("kits");

export const metadata = metadataForDocsPath(overview.href);

export default function KitsPage() {
  return (
    <>
      <DocsPageStructuredData pathname={overview.href} />
      <CatalogGalleryPage label={overview.label} title={overview.name} summary={overview.summary} groups={kitGalleryGroups()} />
    </>
  );
}
