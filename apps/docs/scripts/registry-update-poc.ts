// POC of the hash-manifest update flow: `--init` records the hash of every installed file, the
// default run then classifies each file as pristine (safe to overwrite), locally modified (never
// overwritten, three-way diff instead), or up to date. `--apply` writes the pristine updates.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryRoot = path.join(root, "registry", "control-ui");
const manifestPath = path.join(root, ".control-ui", "manifest.json");
const init = process.argv.includes("--init");
const apply = process.argv.includes("--apply");

const userOwnedTargets = new Set(["components/control-ui/skin.config.tsx"]);

function contentHash(content: string): string {
  return `sha256-${createHash("sha256").update(content).digest("hex").slice(0, 16)}`;
}

function installedFiles(): Map<string, string> {
  const byTarget = new Map<string, string>();
  for (const entry of readdirSync(registryRoot)
    .filter((name) => name.endsWith(".json"))
    .sort()) {
    const manifest: { files?: { path?: string; target?: string }[] } = JSON.parse(readFileSync(path.join(registryRoot, entry), "utf8"));
    for (const file of manifest.files ?? []) {
      if (!file.path || !file.target) continue;
      const target = file.target.startsWith("@components/") ? file.target.slice(1) : file.target;
      if (!target.startsWith("components/control-ui/") || userOwnedTargets.has(target)) continue;
      byTarget.set(target, file.path);
    }
  }
  return byTarget;
}

const files = installedFiles();

if (init) {
  const hashes: Record<string, string> = {};
  for (const target of [...files.keys()].sort()) {
    const absolute = path.join(root, target);
    if (existsSync(absolute)) hashes[target] = contentHash(readFileSync(absolute, "utf8"));
  }
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify({ files: hashes }, null, 2)}\n`);
  console.log(`Recorded ${Object.keys(hashes).length} installed file hashes in .control-ui/manifest.json`);
  process.exit(0);
}

if (!existsSync(manifestPath)) {
  console.error("No .control-ui/manifest.json — run with --init after installing.");
  process.exit(1);
}

const manifest: { files: Record<string, string> } = JSON.parse(readFileSync(manifestPath, "utf8"));
let upToDate = 0;
const updated: string[] = [];
const modified: string[] = [];
const added: string[] = [];

for (const [target, source] of [...files.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  const absoluteTarget = path.join(root, target);
  const upstream = readFileSync(path.join(root, source), "utf8");
  if (!existsSync(absoluteTarget) || !(target in manifest.files)) {
    added.push(target);
    continue;
  }
  const installed = readFileSync(absoluteTarget, "utf8");
  if (contentHash(installed) !== manifest.files[target]) {
    modified.push(target);
    continue;
  }
  if (contentHash(upstream) === manifest.files[target]) {
    upToDate++;
    continue;
  }
  updated.push(target);
  if (apply) {
    writeFileSync(absoluteTarget, upstream);
    manifest.files[target] = contentHash(upstream);
  }
}

if (apply && updated.length > 0) writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const shorten = (target: string) => target.replace("components/control-ui/", "");
for (const target of updated) console.log(`  ${shorten(target)}  vierge → ${apply ? "mis à jour" : "update disponible (--apply)"}`);
for (const target of modified) console.log(`  ${shorten(target)}  modifié localement → jamais écrasé, merge 3 voies à faire`);
for (const target of added) console.log(`  ${shorten(target)}  nouveau → --init pour l'adopter`);
console.log(
  `${upToDate} à jour · ${updated.length} vierge(s) à updater · ${modified.length} modifié(s) protégé(s) · ${added.length} nouveau(x)`,
);
process.exit(modified.length > 0 && apply ? 1 : 0);
