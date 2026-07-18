import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { isSkinPageId, skinPageIds } from "@/app/(features)/model/page-ids";
import { SkinPage } from "@/app/(features)/page-templates/skin-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ skinId: string }> };

export function generateStaticParams() {
  return skinPageIds.map((skinId) => ({ skinId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { skinId } = await params;
  return metadataForDocsPath(`/skins/${skinId}`);
}

export default async function SkinDocsPage({ params }: PageProps) {
  const { skinId } = await params;

  if (!isSkinPageId(skinId)) notFound();
  const skin = getDocsData().skinPages.find((entry) => entry.id === skinId);
  if (!skin) notFound();

  return (
    <>
      <DocsPageStructuredData pathname={`/skins/${skinId}`} />
      <SkinPage skin={skin} />
    </>
  );
}
