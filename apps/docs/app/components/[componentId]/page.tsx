import { notFound } from "next/navigation";
import { ServerLoadedPreviewsProvider } from "@/app/(features)/components/previews";
import { componentPagePreviews } from "@/app/(features)/components/server-previews";
import { getDocsData } from "@/app/(features)/model/data";
import { componentPageIds, isComponentPageId } from "@/app/(features)/model/page-ids";
import { ComponentPage } from "@/app/(features)/page-templates/component-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ componentId: string }> };

export function generateStaticParams() {
  return componentPageIds.map((componentId) => ({ componentId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { componentId } = await params;
  return metadataForDocsPath(`/components/${componentId}`);
}

export default async function ComponentDocsPage({ params }: PageProps) {
  const { componentId } = await params;

  if (!isComponentPageId(componentId)) notFound();
  const data = getDocsData();
  const component = data.components.find((entry) => entry.id === componentId);
  if (!component) notFound();
  const extensions = data.extensions.filter((extension) => extension.appliesTo?.some((id) => id === component.id));
  const previews = componentPagePreviews(
    component.id,
    extensions.map((extension) => extension.id),
  );

  return (
    <ServerLoadedPreviewsProvider previews={previews}>
      <DocsPageStructuredData pathname={`/components/${componentId}`} />
      <ComponentPage component={component} extensions={extensions} />
    </ServerLoadedPreviewsProvider>
  );
}
