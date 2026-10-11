import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { componentPageIds, isComponentPageId } from "@/app/(features)/model/page-ids";
import { RoutedComponentPage } from "@/app/(features)/page-templates/routed-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ kitId: string }> };

export function generateStaticParams() {
  return componentPageIds.map((kitId) => ({ kitId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { kitId } = await params;
  return metadataForDocsPath(`/kits/${kitId}`);
}

export default async function KitDocsPage({ params }: PageProps) {
  const { kitId } = await params;

  if (!isComponentPageId(kitId)) notFound();
  const data = getDocsData();
  const kit = data.components.find((entry) => entry.id === kitId);
  if (!kit) notFound();
  const extensions = data.extensions.filter((extension) => extension.appliesTo?.some((id) => id === kit.id));

  return (
    <>
      <DocsPageStructuredData pathname={`/kits/${kitId}`} />
      <RoutedComponentPage component={kit} extensions={extensions} />
    </>
  );
}
