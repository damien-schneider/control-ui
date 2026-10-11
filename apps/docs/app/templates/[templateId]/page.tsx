import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { blockPageIds, isBlockPageId } from "@/app/(features)/model/page-ids";
import { RoutedTemplatePage } from "@/app/(features)/page-templates/routed-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ templateId: string }> };

export function generateStaticParams() {
  return blockPageIds.map((templateId) => ({ templateId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { templateId } = await params;
  return metadataForDocsPath(`/templates/${templateId}`);
}

export default async function TemplateDocsPage({ params }: PageProps) {
  const { templateId } = await params;

  if (!isBlockPageId(templateId)) notFound();
  const block = getDocsData().blocks.find((entry) => entry.id === templateId);
  if (!block) notFound();

  return (
    <>
      <DocsPageStructuredData pathname={`/templates/${templateId}`} />
      <RoutedTemplatePage block={block} />
    </>
  );
}
