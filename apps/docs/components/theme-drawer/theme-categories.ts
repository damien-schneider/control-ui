import type { ThemeContractGroup } from "@/src/registry/lib/theme-contract";

export const THEME_EDITOR_PATH = "/theme-editor";
export const SKIN_CATEGORY = "skin";

export type ThemeCategoryId = typeof SKIN_CATEGORY | ThemeContractGroup;
export type ThemeCategory = { id: ThemeCategoryId; title: string; href: string };

export const TOKEN_GROUP_TITLES: Record<ThemeContractGroup, string> = {
  color: "Colors",
  typography: "Typography",
  radius: "Radius & corners",
  shadow: "Shadows",
  motion: "Motion",
  surface: "Surfaces & overlays",
  layout: "Layout & density",
};

export const TOKEN_GROUP_ORDER: readonly ThemeContractGroup[] = ["color", "typography", "radius", "shadow", "motion", "surface", "layout"];

export const THEME_CATEGORIES: readonly ThemeCategory[] = [
  { id: SKIN_CATEGORY, title: "Skin", href: THEME_EDITOR_PATH },
  ...TOKEN_GROUP_ORDER.map((group) => ({ id: group, title: TOKEN_GROUP_TITLES[group], href: `${THEME_EDITOR_PATH}/${group}` })),
];

export const THEME_CATEGORY_SLUGS = TOKEN_GROUP_ORDER;

export function isThemeCategoryPath(pathname: string) {
  return pathname.startsWith(`${THEME_EDITOR_PATH}/`);
}

export function themeCategoryForSlug(slug: string): ThemeCategory | undefined {
  return THEME_CATEGORIES.find((category) => category.id !== SKIN_CATEGORY && category.id === slug);
}

export function themeCategoryForPath(pathname: string): ThemeCategoryId {
  const match = THEME_CATEGORIES.find((category) => category.href === pathname);
  return match?.id ?? SKIN_CATEGORY;
}
