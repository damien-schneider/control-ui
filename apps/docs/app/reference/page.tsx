import { ReferencePage } from "@/app/(features)/page-templates/reference-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

export const metadata = metadataForDocsPath("/reference");

export default function ReferenceRoute() {
  return (
    <>
      <DocsPageStructuredData pathname="/reference" />
      <ReferencePage />
    </>
  );
}
