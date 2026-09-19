import { sectionIndexTargets } from "@/app/(features)/model/page-ids";
import { THEME_EDITOR_PATH } from "@/components/theme-drawer/theme-categories";

export function markdownRedirectForPath(pathname: string): string | undefined {
  const targetsByPath: Record<string, string> = sectionIndexTargets;
  if (targetsByPath[pathname]) return targetsByPath[pathname];
  if (pathname.startsWith(`${THEME_EDITOR_PATH}/`)) return THEME_EDITOR_PATH;
  return undefined;
}
