export type ModelIdentity = {
  /** Who made the model, as a canonical key (`anthropic`, `meta`); the host when the maker can't be read. */
  lab: string | undefined;
  /** The model as people write it: `claude-opus-4-5-20251101` → `Claude Opus 4.5`. */
  name: string;
};

export function modelIdentity(id: string, provider?: string): ModelIdentity {
  const segments = id.split("/");
  const words = modelWords(segments.at(-1) ?? id);
  return { lab: labOfFamily(words[0]) ?? labOfRoute([provider, ...segments.slice(0, -1)]), name: modelName(words) };
}

export function labOfProvider(provider: string | undefined) {
  if (!provider) return undefined;
  const key = provider.split(".")[0].replace(/^~/, "").toLowerCase();
  return PROVIDER_LABS[key] ?? key;
}

function labOfRoute(route: (string | undefined)[]) {
  const labs = route.map(labOfProvider).filter((lab) => lab !== undefined);
  return labs.findLast((lab) => !HOSTS.has(lab)) ?? labs[0];
}

function labOfFamily(word: string | undefined) {
  if (!word) return undefined;
  const family = word.replace(/\d.*$/, "");
  if (/^o\d/.test(word)) return "openai";
  return FAMILY_LABS[family];
}

const DATE_SUFFIX = /-(?:\d{8}|\d{4}-\d{2}-\d{2}|latest)$/;

function modelWords(model: string) {
  return model
    .toLowerCase()
    .replace(/:.*$/, "")
    .replace(DATE_SUFFIX, "")
    .split(/[-_\s]+/)
    .filter(Boolean);
}

function modelName(words: string[]) {
  if (/^o\d/.test(words[0] ?? "")) return words.join("-");
  const joined = joinVersions(words);
  if (joined[0] === "gpt" && joined[1]) {
    const [, version, ...rest] = joined;
    return [`GPT-${version}`, ...rest.map((word) => (OPENAI_LOWERCASE.has(word) ? word : casing(word)))].join(" ");
  }
  return joined.map(casing).join(" ");
}

function joinVersions(words: string[]) {
  const joined: string[] = [];
  for (const word of words) {
    const previous = joined.at(-1);
    if (previous && /^\d{1,2}$/.test(previous) && /^\d{1,2}$/.test(word)) joined[joined.length - 1] = `${previous}.${word}`;
    else joined.push(word);
  }
  return joined;
}

function casing(word: string) {
  if (CASING[word]) return CASING[word];
  if (/^\d+(?:\.\d+)?[bkm]$/.test(word) || /^[a-z]\d+[a-z]?$/.test(word)) return word.toUpperCase();
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const CASING: Record<string, string> = { deepseek: "DeepSeek", glm: "GLM", gpt: "GPT", oss: "OSS", qwq: "QwQ", vl: "VL" };

const OPENAI_LOWERCASE = new Set(["mini", "nano"]);

const FAMILY_LABS: Record<string, string> = {
  chatgpt: "openai",
  claude: "anthropic",
  codestral: "mistral",
  command: "cohere",
  deepseek: "deepseek",
  devstral: "mistral",
  doubao: "bytedance",
  gemini: "google",
  gemma: "google",
  glm: "zai",
  gpt: "openai",
  grok: "xai",
  kimi: "moonshot",
  llama: "meta",
  magistral: "mistral",
  minimax: "minimax",
  ministral: "mistral",
  mistral: "mistral",
  mixtral: "mistral",
  nemotron: "nvidia",
  nova: "amazon",
  phi: "microsoft",
  pixtral: "mistral",
  qwen: "qwen",
  qwq: "qwen",
  sonar: "perplexity",
};

const PROVIDER_LABS: Record<string, string> = {
  alibaba: "qwen",
  "amazon-bedrock": "amazon",
  aws: "amazon",
  bedrock: "amazon",
  "bytedance-seed": "bytedance",
  "deepseek-ai": "deepseek",
  "fireworks-ai": "fireworks",
  "google-vertex": "google",
  "meta-llama": "meta",
  mistralai: "mistral",
  moonshotai: "moonshot",
  togetherai: "together",
  "together-ai": "together",
  vertex: "google",
  "x-ai": "xai",
  "z-ai": "zai",
  zhipu: "zai",
  zhipuai: "zai",
};

const HOSTS = new Set(["cerebras", "fireworks", "groq", "ollama", "openrouter", "together"]);
