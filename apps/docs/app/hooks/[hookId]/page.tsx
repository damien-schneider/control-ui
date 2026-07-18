import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { hookPageIds, isHookPageId } from "@/app/(features)/model/page-ids";
import { HookPage } from "@/app/(features)/page-templates/hook-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ hookId: string }> };

export function generateStaticParams() {
  return hookPageIds.map((hookId) => ({ hookId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { hookId } = await params;
  return metadataForDocsPath(`/hooks/${hookId}`);
}

export default async function HookDocsPage({ params }: PageProps) {
  const { hookId } = await params;

  if (!isHookPageId(hookId)) notFound();
  const hook = getDocsData().hooks.find((entry) => entry.id === hookId);
  if (!hook) notFound();

  return (
    <>
      <DocsPageStructuredData pathname={`/hooks/${hookId}`} />
      <HookPage hook={hook} />
    </>
  );
}
