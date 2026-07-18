import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { componentPageIds, isComponentPageId } from "@/app/(features)/model/page-ids";
import { RoutedComponentPage } from "@/app/(features)/page-templates/routed-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ componentId: string }> };

export function generateStaticParams() {
  return componentPageIds.map((componentId) => ({ componentId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { componentId } = await params;
  return metadataForDocsPath(`/ai/${componentId}`);
}

export default async function ComponentDocsPage({ params }: PageProps) {
  const { componentId } = await params;

  if (!isComponentPageId(componentId)) notFound();
  const data = getDocsData();
  const component = data.components.find((entry) => entry.id === componentId);
  if (!component) notFound();
  const primitives = data.primitives.filter((primitive) => component.usesPrimitives?.some((id) => id === primitive.id));
  const extensions = data.extensions.filter((extension) => extension.appliesTo?.some((id) => id === component.id));

  return (
    <>
      <DocsPageStructuredData pathname={`/ai/${componentId}`} />
      <RoutedComponentPage component={component} primitives={primitives} extensions={extensions} />
    </>
  );
}
