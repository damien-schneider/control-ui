import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { isUtilPageId, utilPageIds } from "@/app/(features)/model/page-ids";
import { UtilPage } from "@/app/(features)/page-templates/util-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ utilId: string }> };

export function generateStaticParams() {
  return utilPageIds.map((utilId) => ({ utilId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { utilId } = await params;
  return metadataForDocsPath(`/utils/${utilId}`);
}

export default async function UtilDocsPage({ params }: PageProps) {
  const { utilId } = await params;

  if (!isUtilPageId(utilId)) notFound();
  const util = getDocsData().utils.find((entry) => entry.id === utilId);
  if (!util) notFound();

  return (
    <>
      <DocsPageStructuredData pathname={`/utils/${utilId}`} />
      <UtilPage util={util} />
    </>
  );
}
