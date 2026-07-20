import { notFound, permanentRedirect } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { docsPathForPageId, guidePageIds, isGuidePageId } from "@/app/(features)/model/page-ids";
import { RoutedGuidePage } from "@/app/(features)/page-templates/routed-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

export const instant = false;

type PageProps = { params: Promise<{ pageId: string }> };

export function generateStaticParams() {
  return guidePageIds.map((pageId) => ({ pageId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { pageId } = await params;
  return metadataForDocsPath(`/${pageId}`);
}

export default async function DocsPage({ params }: PageProps) {
  const { pageId } = await params;

  if (pageId === "refined-chat") permanentRedirect("/use-cases/chat");
  const nestedPath = docsPathForPageId(pageId);
  if (nestedPath) permanentRedirect(nestedPath);
  if (!isGuidePageId(pageId)) notFound();
  const page = getDocsData().guides.find((guide) => guide.id === pageId);
  if (!page) notFound();

  return (
    <>
      <DocsPageStructuredData pathname={`/${pageId}`} />
      <RoutedGuidePage page={page} />
    </>
  );
}
