import { notFound } from "next/navigation";
import { ServerLoadedPreviewsProvider } from "@/app/(features)/components/previews";
import { kitPagePreviews } from "@/app/(features)/components/server-previews";
import { getDocsData } from "@/app/(features)/model/data";
import { isKitPageId, kitPageIds } from "@/app/(features)/model/page-ids";
import { RoutedKitPage } from "@/app/(features)/page-templates/routed-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ kitId: string }> };

export function generateStaticParams() {
  return kitPageIds.map((kitId) => ({ kitId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { kitId } = await params;
  return metadataForDocsPath(`/kits/${kitId}`);
}

export default async function KitDocsPage({ params }: PageProps) {
  const { kitId } = await params;

  if (!isKitPageId(kitId)) notFound();
  const data = getDocsData();
  const kit = data.kits.find((entry) => entry.id === kitId);
  if (!kit) notFound();
  const extensions = data.extensions.filter((extension) => extension.appliesTo?.some((id) => id === kit.id));
  const previews = kitPagePreviews(
    kit.id,
    extensions.map((extension) => extension.id),
  );

  return (
    <ServerLoadedPreviewsProvider previews={previews}>
      <DocsPageStructuredData pathname={`/kits/${kitId}`} />
      <RoutedKitPage kit={kit} extensions={extensions} />
    </ServerLoadedPreviewsProvider>
  );
}
