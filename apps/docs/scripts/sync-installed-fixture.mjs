import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const watchMode = process.argv.includes("--watch");

// ONE installed fixture — this is the WYSIWYG guarantee: every preview renders the exact files an
// installer would own.
//
// - Control UI → components/control-ui/* : verbatim union of the files installed by flat `/r/<item>.json` payloads. The docs
//             alias @/components/control-ui/* points here, so previews render the real thing.
const CONTROL_UI = {
  source: "control-ui",
  registryRoot: path.join(root, "registry", "control-ui"),
  fixtureDir: "components/control-ui",
};
const fixtures = [CONTROL_UI];
const watchRoots = ["src/registry", "registry/control-ui"];
const watchPollIntervalMs = 500;

// User-owned targets: the registry ships a default, but after install the file belongs to the
// consumer (docs included — its copy carries the gallery's dynamic skin config). Sync seeds them
// when missing and never claws them back, mirroring how a real app keeps its customized copy.
const userOwnedTargets = new Set(["components/control-ui/skin.config.tsx"]);

function manifestPaths(registryRoot) {
  return readdirSync(registryRoot)
    .filter((entry) => entry.endsWith(".json"))
    .sort()
    .map((entry) => path.join(registryRoot, entry));
}

function dependencyManifestPaths(registryRoot) {
  return walk(path.dirname(registryRoot))
    .filter((filePath) => filePath.endsWith(".json"))
    .sort();
}

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const filePath = path.join(directory, entry);
    return statSync(filePath).isDirectory() ? walk(filePath) : [filePath];
  });
}

function fixtureTarget(target) {
  return target.startsWith("@components/") ? target.slice(1) : target;
}

function requiredManifest(manifests, name) {
  const manifest = manifests.get(name);
  if (!manifest) throw new Error(`Registry dependency ${name} has no Control UI source manifest`);
  return manifest;
}

function collectManifestFiles(manifest, filesByTarget) {
  for (const file of manifest.files ?? []) {
    if (!file.path || !file.target) continue;
    const target = fixtureTarget(file.target);
    if (!target.startsWith("components/control-ui/")) continue;
    filesByTarget.set(target, file.path);
  }
}

function collectFixtureManifest(name, visiting, manifests, filesByTarget) {
  if (visiting.has(name)) throw new Error(`Registry dependency cycle: ${[...visiting, name].join(" -> ")}`);
  const manifest = requiredManifest(manifests, name);
  const nextVisiting = new Set(visiting).add(name);

  for (const dependency of manifest.registryDependencies ?? []) {
    collectFixtureManifest(dependency, nextVisiting, manifests, filesByTarget);
  }
  collectManifestFiles(manifest, filesByTarget);
}

// Every source-path → target-path mapping the fixture must materialise: a plain manifest → fixture
// copy.
function fixtureFiles(fixture) {
  const filesByTarget = new Map();
  const manifests = new Map();
  const entryNames = [];

  for (const manifestPath of manifestPaths(fixture.registryRoot)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    entryNames.push(manifest.name);
  }

  for (const manifestPath of dependencyManifestPaths(fixture.registryRoot)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifests.set(manifest.name, manifest);
  }

  for (const name of entryNames) {
    collectFixtureManifest(name, new Set(), manifests, filesByTarget);
  }

  return [...filesByTarget.entries()].sort((first, second) => first[0].localeCompare(second[0]));
}

function syncGeneratedContent(targetPath, desired, provenance, written, outOfSync) {
  const absoluteTargetPath = path.join(root, targetPath);
  const target = existsSync(absoluteTargetPath) ? readFileSync(absoluteTargetPath, "utf8") : undefined;

  if (target === desired || (userOwnedTargets.has(targetPath) && target !== undefined)) return;

  if (checkOnly) {
    outOfSync.push(`${targetPath} is not generated from ${provenance}`);
    return;
  }

  mkdirSync(path.dirname(absoluteTargetPath), { recursive: true });
  writeFileSync(absoluteTargetPath, desired);
  written.push(targetPath);
}

function syncExpectedFile(targetPath, sourcePath, written, outOfSync) {
  const desired = readFileSync(path.join(root, sourcePath), "utf8");
  syncGeneratedContent(targetPath, desired, sourcePath, written, outOfSync);
}

const FIXTURE_README = [
  "# Generated — do not edit",
  "",
  "Everything under `components/control-ui/` is the installed fixture: the exact files a registry",
  "install would own, synced from the manifests by `scripts/sync-installed-fixture.mjs`",
  "(`bun run sync:fixture`, watched in dev).",
  "Edit the sources in `src/registry/` instead, then run `bun run sync`.",
  "",
  "Exception: `skin.config.tsx` is user-owned — sync seeds it once and never claws it back.",
  "",
].join("\n");

function removeStaleFixtureFiles(fixture, expectedTargets, written, outOfSync) {
  const fixtureRoot = path.join(root, fixture.fixtureDir);
  if (!existsSync(fixtureRoot)) return;

  for (const absolutePath of walk(fixtureRoot)) {
    const targetPath = path.relative(root, absolutePath);
    if (expectedTargets.has(targetPath) || userOwnedTargets.has(targetPath)) continue;
    if (checkOnly) outOfSync.push(`${targetPath} is stale`);
    else {
      unlinkSync(absolutePath);
      written.push(targetPath);
    }
  }
}

function syncFixture(fixture, written, outOfSync) {
  const expectedFiles = fixtureFiles(fixture);
  const expectedTargets = new Set(expectedFiles.map(([targetPath]) => targetPath));

  for (const [targetPath, sourcePath] of expectedFiles) {
    syncExpectedFile(targetPath, sourcePath, written, outOfSync);
  }

  const readmeTarget = path.join(fixture.fixtureDir, "README.md");
  expectedTargets.add(readmeTarget);
  syncGeneratedContent(readmeTarget, FIXTURE_README, "scripts/sync-installed-fixture.mjs", written, outOfSync);

  removeStaleFixtureFiles(fixture, expectedTargets, written, outOfSync);
}

// One pass over every mapping. In --check mode it only records drift; otherwise it writes the
// changed targets and returns which ones were rewritten (so --watch can log them).
function syncOnce() {
  const written = [];
  const outOfSync = [];

  for (const fixture of fixtures) {
    syncFixture(fixture, written, outOfSync);
  }

  return { written, outOfSync };
}

function watchSignature() {
  const entries = [];

  const visit = (relativePath) => {
    const absolutePath = path.join(root, relativePath);
    const stat = statSync(absolutePath);
    entries.push(`${relativePath}:${stat.mtimeMs}:${stat.size}`);

    if (!stat.isDirectory()) return;

    for (const entry of readdirSync(absolutePath).sort()) {
      visit(path.join(relativePath, entry));
    }
  };

  for (const watchRoot of watchRoots) {
    if (existsSync(path.join(root, watchRoot))) visit(watchRoot);
  }

  return entries.join("\n");
}

if (watchMode) {
  // Polling avoids recursive fs.watch descriptor exhaustion while still catching new files.
  const initial = syncOnce();
  console.log(`Installed fixture synced from the Control UI registry manifests (watching ${watchRoots.join(", ")}).`);
  if (initial.written.length > 0) console.log(`  synced: ${initial.written.join(", ")}`);

  let lastSignature = watchSignature();
  setInterval(() => {
    try {
      const nextSignature = watchSignature();
      if (nextSignature === lastSignature) return;
      lastSignature = nextSignature;

      const { written } = syncOnce();
      if (written.length > 0) console.log(`Fixtures re-synced: ${written.join(", ")}`);
    } catch (error) {
      console.error(`Fixture sync skipped (transient): ${error.message}`);
    }
  }, watchPollIntervalMs);
  // Keep the process alive until the dev task is killed.
} else {
  const { outOfSync } = syncOnce();

  if (outOfSync.length > 0) {
    console.error(outOfSync.map((item) => `- ${item}`).join("\n"));
    process.exit(1);
  }

  console.log(checkOnly ? "Installed fixture is in sync." : "Installed fixture synced from the Control UI registry manifests.");
}
