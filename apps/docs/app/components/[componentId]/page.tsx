import { notFound, permanentRedirect } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { componentPageIds, isComponentPageId, isPrimitivePageId, primitivePageIds } from "@/app/(features)/model/page-ids";
import { PrimitivePage } from "@/app/(features)/page-templates/primitive-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ componentId: string }> };

export function generateStaticParams() {
  return [...primitivePageIds, ...componentPageIds].map((componentId) => ({ componentId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { componentId } = await params;
  return metadataForDocsPath(`/components/${componentId}`);
}

export default async function ComponentDocsPage({ params }: PageProps) {
  const { componentId } = await params;

  if (isComponentPageId(componentId)) permanentRedirect(`/kits/${componentId}`);
  if (!isPrimitivePageId(componentId)) notFound();
  const data = getDocsData();
  const primitive = data.primitives.find((entry) => entry.id === componentId);
  if (!primitive) notFound();
  const extensions = data.extensions.filter((extension) => extension.appliesTo?.some((id) => id === primitive.id));

  return (
    <>
      <DocsPageStructuredData pathname={`/components/${componentId}`} />
      <PrimitivePage primitive={primitive} extensions={extensions} />
    </>
  );
}
