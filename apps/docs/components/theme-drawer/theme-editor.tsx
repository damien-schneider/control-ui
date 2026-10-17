"use client";

import { Text } from "@/components/control-ui/ui/typography";
import { useThemeModePreference } from "@/components/theme-toggle";
import { useSkinSource } from "./skin-source";
import { SkinWorkspace } from "./skin-source-view";
import { SKIN_CATEGORY, type ThemeCategoryId } from "./theme-categories";
import { ThemeTokenPanel } from "./theme-editor-aside";
import { ThemeGeneratorDrawer } from "./theme-generator-drawer";
import { ThemePreviews } from "./theme-previews";
import { useThemeRuntime } from "./theme-runtime-context";

export function ThemeEditor({ category }: { category: ThemeCategoryId }) {
  const { t: theme, storageError } = useThemeRuntime();
  useThemeModePreference();
  const { source: skinSource, retry: retrySource } = useSkinSource(theme.skin);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {storageError ? (
        <Text role="alert" as="p" size="caption" tone="destructive">
          {storageError}
        </Text>
      ) : null}
      {category === SKIN_CATEGORY ? (
        <SkinWorkspace skin={theme.skin} source={skinSource} onRetry={retrySource}>
          <ThemePreviews category={category} />
        </SkinWorkspace>
      ) : (
        <>
          <div className="mb-6 @min-[55rem]/page-layout:hidden">
            <ThemeTokenPanel group={category} />
          </div>
          <ThemePreviews category={category} />
        </>
      )}
      <ThemeGeneratorDrawer />
    </div>
  );
}
