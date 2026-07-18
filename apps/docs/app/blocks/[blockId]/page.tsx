import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { blockPageIds, isBlockPageId } from "@/app/(features)/model/page-ids";
import { RoutedBlockPage } from "@/app/(features)/page-templates/routed-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ blockId: string }> };

export function generateStaticParams() {
  return blockPageIds.map((blockId) => ({ blockId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { blockId } = await params;
  return metadataForDocsPath(`/blocks/${blockId}`);
}

export default async function BlockDocsPage({ params }: PageProps) {
  const { blockId } = await params;

  if (!isBlockPageId(blockId)) notFound();
  const block = getDocsData().blocks.find((entry) => entry.id === blockId);
  if (!block) notFound();

  return (
    <>
      <DocsPageStructuredData pathname={`/blocks/${blockId}`} />
      <RoutedBlockPage block={block} />
    </>
  );
}
