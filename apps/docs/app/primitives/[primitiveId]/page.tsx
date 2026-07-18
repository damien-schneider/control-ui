import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { isPrimitivePageId, primitivePageIds } from "@/app/(features)/model/page-ids";
import { PrimitivePage } from "@/app/(features)/page-templates/primitive-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

export const instant = false;

type PageProps = { params: Promise<{ primitiveId: string }> };

export function generateStaticParams() {
  return primitivePageIds.map((primitiveId) => ({ primitiveId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { primitiveId } = await params;
  return metadataForDocsPath(`/primitives/${primitiveId}`);
}

export default async function PrimitiveDocsPage({ params }: PageProps) {
  const { primitiveId } = await params;

  if (!isPrimitivePageId(primitiveId)) notFound();
  const data = getDocsData();
  const primitive = data.primitives.find((entry) => entry.id === primitiveId);
  if (!primitive) notFound();
  const extensions = data.extensions.filter((extension) => extension.appliesTo?.some((id) => id === primitive.id));

  return (
    <>
      <DocsPageStructuredData pathname={`/primitives/${primitiveId}`} />
      <PrimitivePage primitive={primitive} extensions={extensions} />
    </>
  );
}
