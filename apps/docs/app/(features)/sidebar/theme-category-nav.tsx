"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/control-ui/ui/sidebar";
import { THEME_CATEGORIES, themeCategoryForPath } from "@/components/theme-drawer/theme-categories";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { categoryTokenNames, TOKEN_CATEGORIES } from "@/components/theme-drawer/token-metadata";

export function ThemeCategoryNav({ onNavigate }: { onNavigate: () => void }) {
  const activeCategory = themeCategoryForPath(usePathname());
  const { t } = useThemeRuntime();
  const edited = new Set([...Object.keys(t.overrides), ...Object.keys(t.light), ...Object.keys(t.dark)]);

  return (
    <SidebarGroup>
      <SidebarMenu indicator="hover">
        {THEME_CATEGORIES.map((category) => {
          const tokens = TOKEN_CATEGORIES.find((tokenCategory) => tokenCategory.group === category.id);
          const editCount = tokens ? categoryTokenNames(tokens).filter((name) => edited.has(name)).length : 0;
          const isActive = activeCategory === category.id;
          return (
            <SidebarMenuItem key={category.id}>
              <SidebarMenuButton
                render={
                  <Link
                    href={category.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={editCount > 0 ? `${category.title}, ${editCount} edited` : undefined}
                  />
                }
                isActive={isActive}
                size="sm"
              >
                <span className="min-w-0 truncate">{category.title}</span>
                {editCount > 0 ? (
                  <span aria-hidden className="ml-auto text-caption text-muted-foreground">
                    {editCount}
                  </span>
                ) : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
