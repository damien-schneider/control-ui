import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const temporaryRoot = mkdtempSync(path.join(tmpdir(), "control-ui-registry-install-"));
const registryBase = "http://127.0.0.1:3000";
const activeSkinFiles = ["skin.config.tsx", "styles/skin-theme.css", "styles/skin.css"];
const server = spawn(process.execPath, [path.join(root, "scripts/serve-public-registry.mjs"), path.join(root, "public"), "3000"], {
  stdio: "ignore",
});

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function fixture(name, sourceLayout) {
  const directory = path.join(temporaryRoot, name);
  const appRoot = sourceLayout ? "src/app" : "app";
  const aliasTarget = sourceLayout ? "./src/*" : "./*";
  mkdirSync(path.join(directory, appRoot), { recursive: true });
  writeJson(path.join(directory, "package.json"), {
    name,
    private: true,
    packageManager: "bun@1.3.5",
    dependencies: { react: "^19.2.0", "react-dom": "^19.2.0" },
    devDependencies: { "@types/react": "^19.2.17", "@types/react-dom": "^19.2.3" },
  });
  writeJson(path.join(directory, "tsconfig.json"), {
    compilerOptions: {
      jsx: "react-jsx",
      lib: ["dom", "es2022"],
      module: "esnext",
      moduleResolution: "bundler",
      noEmit: true,
      paths: { "@/*": [aliasTarget] },
      skipLibCheck: true,
      target: "es2022",
    },
    include: [
      sourceLayout ? "src/components/**/*.ts" : "components/**/*.ts",
      sourceLayout ? "src/components/**/*.tsx" : "components/**/*.tsx",
    ],
  });
  writeJson(path.join(directory, "components.json"), {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: true,
    tsx: true,
    tailwind: { css: `${appRoot}/globals.css`, baseColor: "neutral", cssVariables: true },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
  });
  writeFileSync(path.join(directory, appRoot, "globals.css"), '@import "tailwindcss";\n');
  return directory;
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error([`Command failed: ${command} ${args.join(" ")}`, result.stdout, result.stderr].filter(Boolean).join("\n"));
  }
}

function install(directory, item) {
  run("bunx", ["shadcn", "add", `${registryBase}/r/${item}.json`, "--yes"], directory);
}

function replaceInstalledSkin(directory, item, sourceLayout) {
  const controlUiRoot = path.join(directory, sourceLayout ? "src/components/control-ui" : "components/control-ui");
  for (const file of activeSkinFiles) rmSync(path.join(controlUiRoot, file), { force: true });
  install(directory, item);
}

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const filePath = path.join(directory, entry);
    return statSync(filePath).isDirectory() ? walk(filePath) : [filePath];
  });
}

async function waitForRegistry() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${registryBase}/r/registry.json`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Registry server did not start at ${registryBase}`);
}

try {
  await waitForRegistry();
  const publicRegistry = await fetch(`${registryBase}/r/registry.json`).then((response) => response.json());
  const fullInstallIds = publicRegistry.items
    .map((item) => item.name)
    .filter((name) => name.startsWith("all-"))
    .sort();
  const skinIds = publicRegistry.items
    .map((item) => item.name)
    .filter((name) => name.startsWith("skin-"))
    .map((name) => `all-${name.slice("skin-".length)}`)
    .sort();
  if (fullInstallIds.join("\n") !== skinIds.join("\n")) {
    throw new Error("The public registry does not expose one full-install manifest per skin");
  }
  const rootFixture = fixture("root-layout", false);
  install(rootFixture, "skin-cuicui");
  install(rootFixture, "chat-message");
  install(rootFixture, "activity");
  install(rootFixture, "stepper");

  const rootComponents = path.join(rootFixture, "components/control-ui");
  const coreContractPath = path.join(rootComponents, "contracts.ts");
  const coreContractBeforeSkinReplacement = readFileSync(coreContractPath, "utf8");
  replaceInstalledSkin(rootFixture, "skin-modern-apple", false);
  if (readFileSync(coreContractPath, "utf8") !== coreContractBeforeSkinReplacement) {
    throw new Error("Replacing a skin changed a core-owned file");
  }
  if (!readFileSync(path.join(rootComponents, "skin.config.tsx"), "utf8").includes('id: "modern-apple"')) {
    throw new Error("The replacement skin did not install its active config");
  }

  const sourceFixture = fixture("source-layout", true);
  install(sourceFixture, "skin-refined");
  install(sourceFixture, "chat-composer");
  install(sourceFixture, "chat-block");
  install(sourceFixture, "coding-agent-block");
  install(sourceFixture, "file-explorer-block");
  install(sourceFixture, "settings-block");
  install(sourceFixture, "morphing-panel");
  install(sourceFixture, "code");

  const aggregateFixture = fixture("all-components", false);
  install(aggregateFixture, "all");

  const fullInstallFixtures = [];
  for (const fullInstallId of fullInstallIds) {
    const directory = fixture(fullInstallId, false);
    install(directory, fullInstallId);
    const installedSkin = readFileSync(path.join(directory, "components/control-ui/skin.config.tsx"), "utf8");
    if (!installedSkin.includes(`id: "${fullInstallId.slice("all-".length)}"`)) {
      throw new Error(`${fullInstallId} installed the wrong active skin`);
    }
    fullInstallFixtures.push(directory);
  }

  const refinedFullInstall = fullInstallFixtures[fullInstallIds.indexOf("all-refined")];
  if (!refinedFullInstall) throw new Error("The public registry is missing all-refined");
  const refinedComponents = path.join(refinedFullInstall, "components/control-ui");
  const canonicalFiles = walk(refinedComponents)
    .map((filePath) => path.relative(refinedComponents, filePath))
    .filter((relativePath) => !activeSkinFiles.includes(relativePath));
  for (const directory of fullInstallFixtures) {
    const components = path.join(directory, "components/control-ui");
    for (const relativePath of canonicalFiles) {
      const expected = readFileSync(path.join(refinedComponents, relativePath), "utf8");
      const actual = readFileSync(path.join(components, relativePath), "utf8");
      if (actual !== expected) throw new Error(`${path.basename(directory)} changed canonical component source ${relativePath}`);
    }
  }

  const tsc = path.resolve(root, "../../node_modules/.bin/tsc");
  run(tsc, ["-p", path.join(rootFixture, "tsconfig.json")], rootFixture);
  run(tsc, ["-p", path.join(sourceFixture, "tsconfig.json")], sourceFixture);
  run(tsc, ["-p", path.join(aggregateFixture, "tsconfig.json")], aggregateFixture);
  for (const directory of fullInstallFixtures) run(tsc, ["-p", path.join(directory, "tsconfig.json")], directory);

  for (const directory of [rootFixture, sourceFixture, aggregateFixture, ...fullInstallFixtures]) {
    const installedFiles = walk(directory);
    if (installedFiles.some((filePath) => filePath.includes(`${path.sep}components${path.sep}ui${path.sep}`))) {
      throw new Error(`${directory} unexpectedly writes into the host components/ui tree`);
    }
    if (
      installedFiles.some((filePath) =>
        ["skin-contract.json", "theme-contract.json", "generated-skin-contract.ts"].includes(path.basename(filePath)),
      )
    ) {
      throw new Error(`${directory} installed registry discovery artifacts into the application`);
    }
    if (installedFiles.some((filePath) => /gen-skin-contract|skin-contract\/collect/.test(readFileSync(filePath, "utf8")))) {
      throw new Error(`${directory} installed AST contract tooling into the application`);
    }
  }

  const sourceComponents = path.join(sourceFixture, "src/components/control-ui");
  const aggregateComponents = path.join(aggregateFixture, "components/control-ui");
  if (
    !statSync(rootComponents).isDirectory() ||
    !statSync(sourceComponents).isDirectory() ||
    !statSync(aggregateComponents).isDirectory()
  ) {
    throw new Error("The @components target did not resolve for both root and src layouts");
  }

  const aggregateGlobals = readFileSync(path.join(aggregateFixture, "app/globals.css"), "utf8");
  for (const stylesheet of ["theme.css", "effects.css", "skin-theme.css", "skin.css"]) {
    if (!aggregateGlobals.includes(`components/control-ui/styles/${stylesheet}`)) {
      throw new Error(`The all item did not wire ${stylesheet} into app/globals.css`);
    }
  }

  for (const directory of fullInstallFixtures) {
    const globals = readFileSync(path.join(directory, "app/globals.css"), "utf8");
    for (const stylesheet of ["theme.css", "effects.css", "skin-theme.css", "skin.css"]) {
      if (!globals.includes(`components/control-ui/styles/${stylesheet}`)) {
        throw new Error(`${path.basename(directory)} did not wire ${stylesheet} into app/globals.css`);
      }
    }
  }
  if (!readFileSync(path.join(aggregateComponents, "skin.config.tsx"), "utf8").includes('id: "refined"')) {
    throw new Error("The all item did not install the Refined skin");
  }

  const shikiVersion = JSON.parse(readFileSync(path.join(sourceFixture, "package.json"), "utf8")).dependencies?.shiki;
  if (shikiVersion !== "^4.3.1") throw new Error(`Expected the tested Shiki range, received ${String(shikiVersion)}`);

  console.log(
    `Registry install smoke test passed (root layout, src layout, all alias, ${fullInstallFixtures.length} per-skin full installs, source invariance, and TypeScript).`,
  );
} finally {
  if (server.exitCode === null) server.kill();
  rmSync(temporaryRoot, { recursive: true, force: true });
}
