import type { ReactNode } from "react";

export type SettingsControlProps = {
  id: string;
  "aria-labelledby": string;
  "aria-describedby"?: string;
};

export type SettingDefinition = {
  id: string;
  title: string;
  description?: string;
  keywords?: readonly string[];
  renderControl: (props: SettingsControlProps) => ReactNode;
};

export type SettingsSectionDefinition = {
  id: string;
  title: string;
  settings: readonly SettingDefinition[];
};

export type SettingsPageDefinition = {
  id: string;
  title: string;
  icon?: ReactNode;
  sections: readonly SettingsSectionDefinition[];
};

export type SettingsSearchResult = {
  page: SettingsPageDefinition;
  section: SettingsSectionDefinition;
  setting: SettingDefinition;
  score: number;
  order: number;
};

export function normalizeSettingsSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

type NormalizedSettingSearchFields = {
  title: string;
  description: string;
  keywords: string;
  pageTitle: string;
  sectionTitle: string;
};

function titleSearchScore(title: string, query: string) {
  if (title === query) return 1_000;
  if (title.startsWith(query)) return 800;
  if (title.includes(query)) return 600;
  return 0;
}

function settingSearchScore(fields: NormalizedSettingSearchFields, query: string, tokens: ReadonlySet<string>) {
  const { title, description, keywords, pageTitle, sectionTitle } = fields;
  const searchableText = [title, description, keywords, pageTitle, sectionTitle].join(" ");
  for (const token of tokens) if (!searchableText.includes(token)) return undefined;

  let score = titleSearchScore(title, query);
  if (keywords.includes(query)) score += 300;
  if (sectionTitle.includes(query)) score += 180;
  if (pageTitle.includes(query)) score += 160;
  if (description.includes(query)) score += 100;
  // Partial-token scoring needs substring checks, so Set membership would change search behavior.
  // react-doctor-disable-next-line react-doctor/js-set-map-lookups
  for (const token of tokens) score += (title.indexOf(token) >= 0 ? 20 : 0) + (keywords.indexOf(token) >= 0 ? 10 : 0);
  return score;
}

export function searchSettings(pages: readonly SettingsPageDefinition[], query: string): SettingsSearchResult[] {
  const normalizedQuery = normalizeSettingsSearchText(query);
  if (!normalizedQuery) return [];

  const tokens = new Set(normalizedQuery.split(" "));
  let order = 0;
  const results: SettingsSearchResult[] = [];

  for (const page of pages) {
    const pageTitle = normalizeSettingsSearchText(page.title);
    for (const section of page.sections) {
      const sectionTitle = normalizeSettingsSearchText(section.title);
      for (const setting of section.settings) {
        const title = normalizeSettingsSearchText(setting.title);
        const description = normalizeSettingsSearchText(setting.description ?? "");
        const keywords = normalizeSettingsSearchText(setting.keywords?.join(" ") ?? "");
        const currentOrder = order;
        order += 1;
        const score = settingSearchScore({ title, description, keywords, pageTitle, sectionTitle }, normalizedQuery, tokens);
        if (score === undefined) continue;
        results.push({ page, section, setting, score, order: currentOrder });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score || a.order - b.order);
}
