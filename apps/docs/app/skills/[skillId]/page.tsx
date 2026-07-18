import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { isSkillPageId, skillPageIds } from "@/app/(features)/model/page-ids";
import { SkillPage } from "@/app/(features)/page-templates/skill-page";
import { DocsPageStructuredData, metadataForDocsPath } from "@/app/(features)/seo/seo";

type PageProps = { params: Promise<{ skillId: string }> };

export function generateStaticParams() {
  return skillPageIds.map((skillId) => ({ skillId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { skillId } = await params;
  return metadataForDocsPath(`/skills/${skillId}`);
}

export default async function SkillDocsPage({ params }: PageProps) {
  const { skillId } = await params;

  if (!isSkillPageId(skillId)) notFound();
  const data = getDocsData();
  const skill = data.skills.find((entry) => entry.id === skillId);
  if (!skill) notFound();
  const concern = data.skillConcerns.find((entry) => entry.id === skill.concern);

  return (
    <>
      <DocsPageStructuredData pathname={`/skills/${skillId}`} />
      <SkillPage skill={skill} concern={concern} />
    </>
  );
}
