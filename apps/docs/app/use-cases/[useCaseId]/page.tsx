import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { blockPageIds, isBlockPageId } from "@/app/(features)/model/page-ids";
import { RoutedUseCasePage } from "@/app/(features)/page-templates/routed-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ useCaseId: string }> };

export function generateStaticParams() {
  return blockPageIds.map((useCaseId) => ({ useCaseId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { useCaseId } = await params;
  return metadataForDocsPath(`/use-cases/${useCaseId}`);
}

export default async function UseCaseDocsPage({ params }: PageProps) {
  const { useCaseId } = await params;

  if (!isBlockPageId(useCaseId)) notFound();
  const block = getDocsData().blocks.find((entry) => entry.id === useCaseId);
  if (!block) notFound();

  return (
    <>
      <DocsPageStructuredData pathname={`/use-cases/${useCaseId}`} />
      <RoutedUseCasePage block={block} />
    </>
  );
}
