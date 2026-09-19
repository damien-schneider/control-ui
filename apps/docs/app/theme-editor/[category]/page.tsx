import { notFound } from "next/navigation";
import { getDocsData } from "@/app/(features)/model/data";
import { RoutedGuidePage } from "@/app/(features)/page-templates/routed-page";
import { metadataForDocsPath } from "@/app/(features)/seo/seo";
import { THEME_CATEGORY_SLUGS, THEME_EDITOR_PATH, themeCategoryForSlug } from "@/components/theme-drawer/theme-categories";

type PageProps = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return THEME_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const themeCategory = themeCategoryForSlug(category);
  const editorMetadata = metadataForDocsPath(THEME_EDITOR_PATH);
  if (!themeCategory) return editorMetadata;

  return { ...editorMetadata, title: `${themeCategory.title} — Theme editor`, robots: { index: false, follow: true } };
}

export default async function ThemeEditorCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const themeCategory = themeCategoryForSlug(category);
  if (!themeCategory) notFound();

  const page = getDocsData().guides.find((guide) => guide.id === "theme-editor");
  if (!page) notFound();

  return <RoutedGuidePage page={page} themeCategory={themeCategory.id} />;
}
