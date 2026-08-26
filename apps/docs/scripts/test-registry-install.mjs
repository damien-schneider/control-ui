import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const temporaryRoot = mkdtempSync(path.join(tmpdir(), "control-ui-registry-install-"));
const registryBase = "http://127.0.0.1:3000";
const activeSkinFiles = ["skin.config.tsx", "styles/skin-theme.css", "styles/skin.css"];
const buttonInstallBudget = { files: 10, bytes: 68_000 };
const server = spawn(process.execPath, [path.join(root, "scripts/serve-public-registry.mjs"), path.join(root, "public"), "3000"], {
  stdio: "ignore",
});

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function fixture(name, sourceLayout, entryPath) {
  const directory = path.join(temporaryRoot, name);
  const appRoot = sourceLayout ? "src/app" : "app";
  const aliasTarget = sourceLayout ? "./src/*" : "./*";
  const cssEntryPath = entryPath ?? `${appRoot}/globals.css`;
  mkdirSync(path.join(directory, appRoot), { recursive: true });
  mkdirSync(path.dirname(path.join(directory, cssEntryPath)), { recursive: true });
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
      noFallthroughCasesInSwitch: true,
      noUncheckedIndexedAccess: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      strict: true,
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
    tailwind: { css: cssEntryPath, baseColor: "neutral", cssVariables: true },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
  });
  writeFileSync(path.join(directory, cssEntryPath), '@import "tailwindcss";\n');
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

function installSkin(directory, item) {
  run("bunx", ["shadcn", "add", `${registryBase}/r/${item}.json`, "--yes", "--overwrite"], directory);
}

function cssEntry(directory) {
  const components = JSON.parse(readFileSync(path.join(directory, "components.json"), "utf8"));
  return path.join(directory, components.tailwind.css);
}

function unresolvedImports(entryPath) {
  const entryDirectory = path.dirname(entryPath);
  return [...readFileSync(entryPath, "utf8").matchAll(/@import\s+"([^"]+)"/g)]
    .map((match) => match[1])
    .filter((specifier) => specifier.startsWith("."))
    .filter((specifier) => !existsSync(path.resolve(entryDirectory, specifier)));
}

function assertImportsResolve(directory) {
  const entryPath = cssEntry(directory);
  const unresolved = unresolvedImports(entryPath);
  if (unresolved.length > 0) {
    throw new Error(`${path.basename(directory)} wrote imports into ${entryPath} that resolve to no file: ${unresolved.join(", ")}`);
  }
}

function importLines(entryPath) {
  return readFileSync(entryPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("@import"));
}

function duplicateImports(entryPath) {
  const imports = importLines(entryPath);
  return imports.filter((line, index) => imports.indexOf(line) !== index);
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
  if (!readFileSync(path.join(rootFixture, "components/control-ui/skin.config.tsx"), "utf8").includes('id: "cuicui"')) {
    throw new Error("Adding components after a skin replaced the active skin config");
  }

  const rootComponents = path.join(rootFixture, "components/control-ui");
  const coreSkinResolverPath = path.join(rootComponents, "skin.ts");
  const coreSkinResolverBeforeReplacement = readFileSync(coreSkinResolverPath, "utf8");
  installSkin(rootFixture, "skin-modern-apple");
  if (readFileSync(coreSkinResolverPath, "utf8") !== coreSkinResolverBeforeReplacement) {
    throw new Error("Replacing a skin changed a core-owned file");
  }
  for (const file of activeSkinFiles) {
    if (!readFileSync(path.join(rootComponents, file), "utf8").includes("modern-apple")) {
      throw new Error(`Replacing a skin left the previous pack in ${file}`);
    }
  }

  const driftedComponentPath = path.join(rootComponents, "chat-message.tsx");
  const skinCssPath = path.join(rootComponents, "styles/skin.css");
  writeFileSync(driftedComponentPath, `${readFileSync(driftedComponentPath, "utf8")}\n// local drift\n`);
  writeFileSync(skinCssPath, `${readFileSync(skinCssPath, "utf8")}\n/* custom skin */\n`);
  const activeSkinBeforeUpdate = activeSkinFiles.map((file) => readFileSync(path.join(rootComponents, file), "utf8"));
  run("bunx", ["shadcn", "add", `${registryBase}/r/update.json`, "--yes", "--overwrite"], rootFixture);
  if (readFileSync(driftedComponentPath, "utf8").includes("// local drift")) {
    throw new Error("The update manifest did not refresh drifted component source");
  }
  if (duplicateImports(cssEntry(rootFixture)).length > 0) {
    throw new Error("Updating the canonical layout duplicated CSS entry imports; shadcn stopped deduplicating exact lines");
  }
  assertImportsResolve(rootFixture);
  activeSkinFiles.forEach((file, index) => {
    if (readFileSync(path.join(rootComponents, file), "utf8") !== activeSkinBeforeUpdate[index]) {
      throw new Error(`The update manifest overwrote ${file}, which the active skin owns`);
    }
  });

  const componentFirstFixture = fixture("component-first", false);
  install(componentFirstFixture, "button");
  const componentFirstComponents = path.join(componentFirstFixture, "components/control-ui");
  const buttonPayload = walk(componentFirstComponents);
  const buttonBytes = buttonPayload.reduce((total, file) => total + statSync(file).size, 0);
  console.log(`add button installs ${buttonPayload.length} files / ${buttonBytes} B`);
  if (buttonPayload.length > buttonInstallBudget.files || buttonBytes > buttonInstallBudget.bytes) {
    throw new Error(
      `add button exceeds its payload budget (${buttonInstallBudget.files} files / ${buttonInstallBudget.bytes} B): ${buttonPayload
        .map((file) => path.relative(componentFirstComponents, file))
        .join(", ")}`,
    );
  }

  installSkin(componentFirstFixture, "skin-cuicui");
  for (const file of activeSkinFiles) {
    if (!readFileSync(path.join(componentFirstComponents, file), "utf8").includes("cuicui")) {
      throw new Error(`Installing a skin after a component did not activate the pack in ${file}`);
    }
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

  const recipeFiles = ["button.css", "field.css", "popup.css"];
  for (const componentsRoot of [rootComponents, sourceComponents, aggregateComponents]) {
    for (const recipe of recipeFiles) {
      if (!existsSync(path.join(componentsRoot, "styles/recipes", recipe))) {
        throw new Error(`${componentsRoot} is missing the ${recipe} recipe`);
      }
    }
  }

  const aggregateGlobals = readFileSync(path.join(aggregateFixture, "app/globals.css"), "utf8");
  for (const recipe of recipeFiles) {
    if (!aggregateGlobals.includes(`components/control-ui/styles/recipes/${recipe}`)) {
      throw new Error(`The all item did not wire the ${recipe} recipe into app/globals.css`);
    }
  }

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

  for (const directory of [rootFixture, componentFirstFixture, sourceFixture, aggregateFixture, ...fullInstallFixtures]) {
    assertImportsResolve(directory);
  }

  const flatEntryFixture = fixture("flat-entry", true, "src/index.css");
  install(flatEntryFixture, "all");
  const flatEntryPath = cssEntry(flatEntryFixture);
  const flatEntryUnresolved = unresolvedImports(flatEntryPath);
  if (flatEntryUnresolved.length === 0) {
    throw new Error(
      "A CSS entry sitting beside the components alias now resolves the imports the registry writes: drop the rewrite step from the setup prompt",
    );
  }
  const flatEntryPrefix = `./${path.relative(path.dirname(flatEntryPath), path.join(flatEntryFixture, "src/components/control-ui"))}/`;
  writeFileSync(flatEntryPath, readFileSync(flatEntryPath, "utf8").replaceAll("../components/control-ui/", flatEntryPrefix));
  assertImportsResolve(flatEntryFixture);

  writeFileSync(path.join(flatEntryFixture, "src/probe.control-ui-theme.css"), '[data-skin="flat"][data-skin] { --radius: 8px; }\n');
  const flatEntryBeforeTheme = readFileSync(flatEntryPath, "utf8");
  const flatEntrySeparator = flatEntryBeforeTheme.endsWith("\n") ? "" : "\n";
  writeFileSync(flatEntryPath, `${flatEntryBeforeTheme}${flatEntrySeparator}@import "./probe.control-ui-theme.css";\n`);
  const flatEntryImportsBeforeUpdate = importLines(flatEntryPath);
  run("bunx", ["shadcn", "add", `${registryBase}/r/update.json`, "--yes", "--overwrite"], flatEntryFixture);
  if (unresolvedImports(flatEntryPath).length === 0) {
    throw new Error(
      "Updating a rewritten layout no longer re-appends the canonical import block: drop the fix-css-imports chain from the setup prompt",
    );
  }
  run("node", [path.join(flatEntryFixture, "src/components/control-ui/scripts/fix-css-imports.mjs")], flatEntryFixture);
  assertImportsResolve(flatEntryFixture);
  const flatEntryImports = importLines(flatEntryPath);
  const flatEntryLost = flatEntryImportsBeforeUpdate.filter((line) => !flatEntryImports.includes(line));
  if (flatEntryLost.length > 0) {
    throw new Error(`fix-css-imports dropped imports that were wired before the update: ${flatEntryLost.join(", ")}`);
  }
  if (duplicateImports(flatEntryPath).length > 0) {
    throw new Error("fix-css-imports left duplicate imports instead of folding the re-appended block");
  }
  if (!flatEntryImports[flatEntryImports.length - 1].includes("probe.control-ui-theme.css")) {
    throw new Error("fix-css-imports did not keep the theme import last, so re-appended recipes outweigh the theme");
  }

  const doctorScript = path.join(flatEntryFixture, "src/components/control-ui/scripts/control-ui-doctor.mjs");
  const installedSkinId = /\[data-skin="([\w-]+)"\]/.exec(
    readFileSync(path.join(flatEntryFixture, "src/components/control-ui/styles/skin-theme.css"), "utf8"),
  )[1];
  writeFileSync(path.join(flatEntryFixture, "index.html"), `<html data-skin="${installedSkinId}"><body></body></html>\n`);
  const doctorClean = spawnSync("node", [doctorScript], { cwd: flatEntryFixture, encoding: "utf8" });
  if (doctorClean.status !== 0) {
    throw new Error(`control-ui-doctor reported errors on a healed install:\n${doctorClean.stdout}${doctorClean.stderr}`);
  }
  const healthyEntry = readFileSync(flatEntryPath, "utf8");
  writeFileSync(
    flatEntryPath,
    `${healthyEntry}\n:root { --background: red; --chart-1: blue; }\n@theme inline { --radius-sm: calc(var(--radius) - 4px); }\n`,
  );
  const doctorConflict = spawnSync("node", [doctorScript], { cwd: flatEntryFixture, encoding: "utf8" });
  if (doctorConflict.status === 0) {
    throw new Error("control-ui-doctor passed an entry whose @theme block out-merges the skin's radius scale");
  }
  if (!doctorConflict.stderr.includes("--radius-sm")) {
    throw new Error(`control-ui-doctor did not name the conflicting @theme key:\n${doctorConflict.stderr}`);
  }
  if (!doctorConflict.stderr.includes("--chart-1")) {
    throw new Error(`control-ui-doctor did not flag the hybrid :root palette:\n${doctorConflict.stderr}`);
  }
  writeFileSync(flatEntryPath, healthyEntry);

  const shikiVersion = JSON.parse(readFileSync(path.join(sourceFixture, "package.json"), "utf8")).dependencies?.shiki;
  if (shikiVersion !== "^4.4.3") throw new Error(`Expected the tested Shiki range, received ${String(shikiVersion)}`);

  console.log(
    `Registry install smoke test passed (root layout, src layout, component-first skin install, all alias, update overwrite, doctor audit, ${fullInstallFixtures.length} per-skin full installs, source invariance, import resolution, and TypeScript).`,
  );
} finally {
  if (server.exitCode === null) server.kill();
  rmSync(temporaryRoot, { recursive: true, force: true });
}
