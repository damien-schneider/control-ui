import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { extensionPageIds, isExtensionPageId } from "@/app/(features)/model/page-ids";
import { ExtensionPage } from "@/app/(features)/page-templates/extension-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ extensionId: string }> };

export function generateStaticParams() {
  return extensionPageIds.map((extensionId) => ({ extensionId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { extensionId } = await params;
  return metadataForDocsPath(`/extensions/${extensionId}`);
}

export default async function ExtensionDocsPage({ params }: PageProps) {
  const { extensionId } = await params;

  if (!isExtensionPageId(extensionId)) notFound();
  const extension = getDocsData().extensions.find((entry) => entry.id === extensionId);
  if (!extension) notFound();

  return (
    <>
      <DocsPageStructuredData pathname={`/extensions/${extensionId}`} />
      <ExtensionPage extension={extension} />
    </>
  );
}
