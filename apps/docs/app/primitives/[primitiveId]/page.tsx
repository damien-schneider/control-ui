import { notFound, permanentRedirect } from "next/navigation";
import { isPrimitivePageId, primitivePageIds } from "@/app/(features)/model/page-ids";

type PageProps = { params: Promise<{ primitiveId: string }> };

export function generateStaticParams() {
  return primitivePageIds.map((primitiveId) => ({ primitiveId }));
}

export default async function PrimitiveRedirect({ params }: PageProps) {
  const { primitiveId } = await params;
  if (!isPrimitivePageId(primitiveId)) notFound();
  permanentRedirect(`/components/${primitiveId}`);
}
