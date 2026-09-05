import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

type Manifest = {
  name: string;
  registryDependencies?: string[];
  dependencies?: string[];
  files?: { path: string; target: string }[];
  css?: Record<string, unknown>;
};

const packageRoot = import.meta.dir;
const docsRoot = path.resolve(packageRoot, "../../apps/docs");
const componentRoot = "@components/control-ui/";
const styleImport = /^@import "\.\.\/components\/control-ui\/styles\/(.+)"$/;

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const file = path.join(directory, entry);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

function readManifests() {
  const manifests = new Map<string, Manifest>();
  for (const manifestPath of walk(path.join(docsRoot, "registry")).filter((candidate) => candidate.endsWith(".json"))) {
    const manifest: Manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifests.set(manifest.name, manifest);
  }
  return manifests;
}

function itemsInInstallOrder(root: string) {
  const manifests = readManifests();
  const visited = new Set<string>();
  const items: Manifest[] = [];
  const visit = (name: string) => {
    if (visited.has(name)) return;
    visited.add(name);
    const manifest = manifests.get(name);
    if (!manifest) throw new Error(`Registry item ${name} has no manifest`);
    for (const dependency of manifest.registryDependencies ?? []) visit(dependency);
    items.push(manifest);
  };
  visit(root);
  return items;
}

function isSkin(item: Manifest) {
  return item.name.startsWith("skin-");
}

function collectFiles(items: Manifest[]) {
  const files = new Map<string, string>();
  for (const item of items) {
    for (const file of item.files ?? []) {
      if (!file.target.startsWith(componentRoot)) continue;
      const name = file.target.slice(componentRoot.length);
      if (name.startsWith("scripts/")) continue;
      files.set(name, path.join(docsRoot, file.path));
    }
  }
  return files;
}

function collectDependencies(items: Manifest[]) {
  const dependencies = new Map<string, string>();
  for (const dependency of items.flatMap((item) => item.dependencies ?? [])) {
    const versionAt = dependency.lastIndexOf("@");
    dependencies.set(dependency.slice(0, versionAt), dependency.slice(versionAt + 1));
  }
  return dependencies;
}

function collectStyles(items: Manifest[]) {
  const styles: string[] = [];
  const skinLast = [...items.filter((item) => !isSkin(item)), ...items.filter(isSkin)];
  for (const item of skinLast) {
    for (const key of Object.keys(item.css ?? {})) {
      const sheet = styleImport.exec(key)?.[1];
      if (!sheet) throw new Error(`${item.name} declares a css import outside styles/: ${key}`);
      if (!styles.includes(sheet)) styles.push(sheet);
    }
  }
  return styles;
}

export function closure() {
  const items = itemsInInstallOrder("all-refined");
  return { files: collectFiles(items), dependencies: collectDependencies(items), styles: collectStyles(items) };
}

export function stylesIndex(styles: string[]) {
  return `${styles.map((sheet) => `@import "./${sheet}";`).join("\n")}\n`;
}

function assertEveryStylesheetImported(files: Map<string, string>, styles: string[]) {
  const shipped = [...files.keys()].filter((name) => name.endsWith(".css")).sort();
  const imported = styles.map((sheet) => `styles/${sheet}`).sort();
  if (shipped.join("\n") !== imported.join("\n")) {
    throw new Error(`Shipped stylesheets and css imports differ:\n${shipped.join("\n")}\n---\n${imported.join("\n")}`);
  }
}

export function writeSrc() {
  const { files, styles } = closure();
  assertEveryStylesheetImported(files, styles);
  const src = path.join(packageRoot, "src");
  rmSync(src, { recursive: true, force: true });
  for (const [name, source] of files) {
    const target = path.join(src, name);
    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(source, target);
  }
  writeFileSync(path.join(src, "styles/index.css"), stylesIndex(styles));
}

if (import.meta.main) writeSrc();
