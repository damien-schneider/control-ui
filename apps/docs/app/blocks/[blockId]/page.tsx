import { notFound, permanentRedirect } from "next/navigation";
import { blockPageIds, isBlockPageId } from "@/app/(features)/model/page-ids";

type PageProps = { params: Promise<{ blockId: string }> };

export function generateStaticParams() {
  return blockPageIds.map((blockId) => ({ blockId }));
}

export default async function LegacyBlockDocsPage({ params }: PageProps) {
  const { blockId } = await params;
  if (!isBlockPageId(blockId)) notFound();
  permanentRedirect(`/use-cases/${blockId}`);
}
