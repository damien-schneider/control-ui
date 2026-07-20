// Single search corpus shared by human docs (⌘K palette) and agent surface (searchRegistry).
// Pure: no fs, no React — reads id/name/summary off already-metadata-shaped arrays.
// Both client (serialized Docs* props) and server (raw catalog arrays) feed it without divergence.
import { catalogOverviews } from "@/app/(features)/catalog/overviews";
import { skinsOverview } from "@/app/(features)/catalog/skins";
import type { DocsStatus, SearchItem } from "@/app/(features)/model/types";

// Structural inputs both raw catalog arrays and serialized Docs* arrays satisfy (skills: title, skins: label/description, rest: name/summary); both carry catalog-typed ids.
type NamedItem = { id: SearchItem["id"]; name: string; summary: string; status?: DocsStatus };
type SkillItem = { id: SearchItem["id"]; title: string; summary: string };
type SkinItem = { id: SearchItem["id"]; label: string; description: string };

export type SearchCorpus = {
  guides: readonly NamedItem[];
  skills: readonly SkillItem[];
  components: readonly NamedItem[];
  blocks: readonly NamedItem[];
  primitives: readonly NamedItem[];
  hooks: readonly NamedItem[];
  utils: readonly NamedItem[];
  extensions: readonly NamedItem[];
  skinPages: readonly SkinItem[];
};

export function buildSearchItems({
  guides,
  skills,
  components,
  blocks,
  primitives,
  hooks,
  utils,
  extensions,
  skinPages,
}: SearchCorpus): SearchItem[] {
  return [
    ...catalogOverviews,
    ...guides.map<SearchItem>((item) => ({
      id: item.id,
      name: item.name,
      kind: "Guide",
      summary: item.summary,
      href: `/${item.id}`,
    })),
    {
      id: skinsOverview.id,
      name: skinsOverview.label,
      kind: "Skin",
      summary: skinsOverview.description,
      href: "/skins",
    },
    ...skinPages.map<SearchItem>((item) => ({
      id: item.id,
      name: item.label,
      kind: "Skin",
      summary: item.description,
      href: `/skins/${item.id}`,
    })),
    ...skills.map<SearchItem>((item) => ({
      id: item.id,
      name: item.title,
      kind: "Skill",
      summary: item.summary,
      href: `/skills/${item.id}`,
    })),
    ...components.map<SearchItem>((item) => ({
      id: item.id,
      name: item.name,
      kind: "Agent",
      summary: item.summary,
      href: `/ai/${item.id}`,
      status: item.status,
    })),
    ...primitives.map<SearchItem>((item) => ({
      id: item.id,
      name: item.name,
      kind: "Primitive",
      summary: item.summary,
      href: `/primitives/${item.id}`,
      status: item.status,
    })),
    ...hooks.map<SearchItem>((item) => ({
      id: item.id,
      name: item.name,
      kind: "Hook",
      summary: item.summary,
      href: `/hooks/${item.id}`,
    })),
    ...utils.map<SearchItem>((item) => ({
      id: item.id,
      name: item.name,
      kind: "Util",
      summary: item.summary,
      href: `/utils/${item.id}`,
    })),
    ...extensions.map<SearchItem>((item) => ({
      id: item.id,
      name: item.name,
      kind: "Extension",
      summary: item.summary,
      href: `/extensions/${item.id}`,
      status: item.status,
    })),
    ...blocks.map<SearchItem>((item) => ({
      id: item.id,
      name: item.name,
      kind: "Block",
      summary: item.summary,
      href: `/use-cases/${item.id}`,
      status: item.status,
    })),
  ];
}

type SearchQuery = {
  normalized: string;
  terms: string[];
};

type WeightedField = {
  value: string;
  weight: number;
};

const SEARCH_FIELDS = [
  ["name", 1],
  ["id", 0.95],
  ["kind", 0.55],
  ["summary", 0.35],
] as const satisfies readonly (readonly [keyof SearchItem, number])[];

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compactText(value: string) {
  return normalizeText(value).replace(/\s/g, "");
}

function createSearchQuery(query: string): SearchQuery {
  const normalized = normalizeText(query);
  return {
    normalized,
    terms: normalized ? normalized.split(" ") : [],
  };
}

function subsequencePenalty(needle: string, haystack: string) {
  let previousIndex = -1;
  let firstIndex = -1;
  let lastIndex = -1;
  let gapCount = 0;

  for (const char of needle) {
    const nextIndex = haystack.indexOf(char, previousIndex + 1);
    if (nextIndex === -1) return Number.POSITIVE_INFINITY;
    if (firstIndex === -1) firstIndex = nextIndex;
    if (previousIndex !== -1) gapCount += nextIndex - previousIndex - 1;
    previousIndex = nextIndex;
    lastIndex = nextIndex;
  }

  return firstIndex * 2 + gapCount + (lastIndex - firstIndex + 1 - needle.length);
}

function scoreInitials(words: string[], compactNeedle: string) {
  if (compactNeedle.length < 2) return 0;
  const initials = words.map((word) => word[0]).join("");
  if (initials === compactNeedle) return 980;
  if (initials.startsWith(compactNeedle)) return 950 - initials.length;
  const penalty = subsequencePenalty(compactNeedle, initials);
  return Number.isFinite(penalty) ? 890 - penalty * 12 : 0;
}

function scoreNeedle(value: string, needle: string) {
  const normalized = normalizeText(value);
  const compactValue = normalized.replace(/\s/g, "");
  const compactNeedle = compactText(needle);
  if (!normalized || !compactNeedle) return 0;

  const words = normalized.split(" ");
  if (normalized.startsWith(needle) || compactValue.startsWith(compactNeedle)) return 1100;

  const exactWordIndex = words.indexOf(needle);
  if (exactWordIndex !== -1) return 1060 - exactWordIndex * 8;

  const prefixWordIndex = words.findIndex((word) => word.startsWith(needle));
  if (prefixWordIndex !== -1) return 1010 - prefixWordIndex * 8 - words[prefixWordIndex].length * 0.1;

  const initialScore = scoreInitials(words, compactNeedle);
  if (initialScore > 0) return initialScore;

  const phraseIndex = normalized.indexOf(needle);
  if (phraseIndex !== -1) return 780 - phraseIndex * 4;

  const compactIndex = compactValue.indexOf(compactNeedle);
  if (compactIndex !== -1) return 740 - compactIndex * 3;

  if (compactNeedle.length < 2) return 0;
  const penalty = subsequencePenalty(compactNeedle, compactValue);
  return Number.isFinite(penalty) ? 560 - penalty * 10 : 0;
}

function searchFieldsFor(item: SearchItem): WeightedField[] {
  return SEARCH_FIELDS.map(([field, weight]) => ({ value: String(item[field]), weight }));
}

function scoreSearchItem(item: SearchItem, query: SearchQuery) {
  const fields = searchFieldsFor(item);
  const fieldScore = (needle: string) => Math.max(...fields.map((field) => scoreNeedle(field.value, needle) * field.weight));
  const fullQueryScore = fieldScore(query.normalized);
  if (query.terms.length <= 1) return fullQueryScore;

  const termScores = query.terms.map(fieldScore);
  if (termScores.some((score) => score <= 0)) return fullQueryScore;
  const combinedTermScore =
    termScores.reduce((total, score) => total + score, 0) / termScores.length + Math.min(120, query.terms.length * 24);
  return Math.max(fullQueryScore, combinedTermScore);
}

export function scoreCommandSearchItem(value: string, query: string, keywords: string[] = []) {
  const searchQuery = createSearchQuery(query);
  if (!searchQuery.normalized) return 1;

  const [name = "", kind = "", summary = ""] = keywords;
  const fields = [
    { value: name, weight: 1 },
    { value, weight: 0.95 },
    { value: kind, weight: 0.55 },
    { value: summary, weight: 0.35 },
  ] satisfies WeightedField[];

  const fieldScore = (needle: string) => Math.max(...fields.map((field) => scoreNeedle(field.value, needle) * field.weight));
  const fullQueryScore = fieldScore(searchQuery.normalized);
  if (searchQuery.terms.length <= 1) return Math.max(0, Math.min(1, fullQueryScore / 1200));

  const termScores = searchQuery.terms.map(fieldScore);
  const combinedTermScore = termScores.some((score) => score <= 0)
    ? fullQueryScore
    : Math.max(
        fullQueryScore,
        termScores.reduce((total, score) => total + score, 0) / termScores.length + Math.min(120, searchQuery.terms.length * 24),
      );

  return Math.max(0, Math.min(1, combinedTermScore / 1200));
}

// Same match surface as ⌘K palette: name+kind+summary+id, ranked leading matches > word matches > initials > substring > fuzzy; empty query returns whole corpus.
export function matchSearchItems(items: SearchItem[], query: string): SearchItem[] {
  const searchQuery = createSearchQuery(query);
  if (!searchQuery.normalized) return items;

  const results: { item: SearchItem; index: number; score: number }[] = [];
  items.forEach((item, index) => {
    const score = scoreSearchItem(item, searchQuery);
    if (score > 0) results.push({ item, index, score });
  });

  return results.sort((a, b) => b.score - a.score || a.index - b.index).map((result) => result.item);
}
