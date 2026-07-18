import { getDocsShellData } from "@/app/(features)/model/data";
import { SkinsOverviewPage } from "@/app/(features)/page-templates/skin-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

export const metadata = metadataForDocsPath("/skins");

export default function SkinsOverviewRoute() {
  return (
    <>
      <DocsPageStructuredData pathname="/skins" />
      <SkinsOverviewPage skins={getDocsShellData().skinPages} />
    </>
  );
}
