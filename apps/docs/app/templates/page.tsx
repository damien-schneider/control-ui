import { catalogOverview } from "@/app/(features)/catalog/overviews";
import { templateGalleryGroups } from "@/app/(features)/model/catalog-gallery";
import { TemplateGalleryPage } from "@/app/(features)/page-templates/template-gallery-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

const overview = catalogOverview("templates");

export const metadata = metadataForDocsPath(overview.href);

export default function TemplatesPage() {
  return (
    <>
      <DocsPageStructuredData pathname={overview.href} />
      <TemplateGalleryPage label={overview.label} title={overview.name} summary={overview.summary} groups={templateGalleryGroups()} />
    </>
  );
}
