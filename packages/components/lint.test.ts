import { afterAll, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gritRules } from "./lint/grit-rules";

type Rule = "no-component-style-classes" | "no-raw-type-classes";

const packageRoot = import.meta.dir;
const binary = (name: string) => path.join(packageRoot, "node_modules/.bin", name);
const biome = path.join(packageRoot, "../../node_modules/.bin/biome");

const consumer = mkdtempSync(path.join(tmpdir(), "cui-lint-"));
mkdirSync(path.join(consumer, "node_modules/@ctrl-ui"), { recursive: true });
symlinkSync(packageRoot, path.join(consumer, "node_modules/@ctrl-ui/react"));
afterAll(() => rmSync(consumer, { recursive: true }));

const biomeConfig: Record<Rule, object> = {
  "no-component-style-classes": { extends: ["@ctrl-ui/react/biome"] },
  "no-raw-type-classes": { plugins: ["./node_modules/@ctrl-ui/react/lint/no-raw-type-classes.grit"] },
};

const linters = {
  biome(rule: Rule) {
    writeFileSync(path.join(consumer, "biome.json"), JSON.stringify({ ...biomeConfig[rule], linter: { rules: { recommended: false } } }));
    const result = spawnSync(biome, ["lint", "--max-diagnostics=100", "sample.jsx"], { cwd: consumer, encoding: "utf8" });
    return [...`${result.stdout}${result.stderr}`.matchAll(/sample\.jsx:(\d+):\d+ plugin/g)].map((match) => Number(match[1]));
  },
  eslint(rule: Rule) {
    writeFileSync(
      path.join(consumer, "eslint.config.mjs"),
      `import controlUi from "@ctrl-ui/react/eslint-plugin";
export default [{ files: ["**/*.jsx"], languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } }, plugins: { "control-ui": controlUi }, rules: { "control-ui/${rule}": "error" } }];`,
    );
    const result = spawnSync(binary("eslint"), ["--format", "json", "sample.jsx"], { cwd: consumer, encoding: "utf8" });
    const [report] = JSON.parse(result.stdout) as [{ messages: { line: number; ruleId: string | null }[] }];
    return report.messages.map((message) => (message.ruleId === `control-ui/${rule}` ? message.line : -1));
  },
  oxlint(rule: Rule) {
    writeFileSync(
      path.join(consumer, ".oxlintrc.json"),
      JSON.stringify({ jsPlugins: ["@ctrl-ui/react/eslint-plugin"], rules: { [`control-ui/${rule}`]: "error" } }),
    );
    const result = spawnSync(binary("oxlint"), ["--format", "unix", "sample.jsx"], { cwd: consumer, encoding: "utf8" });
    return [...result.stdout.matchAll(/sample\.jsx:(\d+):\d+: .*control-ui\((.+?)\)/g)].map((match) =>
      match[2] === rule ? Number(match[1]) : -1,
    );
  },
};

function flaggedLinesPerLinter(rule: Rule, lines: string[]) {
  writeFileSync(path.join(consumer, "sample.jsx"), lines.join("\n"));
  return Object.fromEntries(Object.entries(linters).map(([name, lint]) => [name, lint(rule)]));
}

function everyLinter(lines: number[]) {
  return Object.fromEntries(Object.keys(linters).map((name) => [name, lines]));
}

const controlUiImports = [
  `import { Button } from "@ctrl-ui/react/ui/button";`,
  `import { Card as Panel, CardHeader } from "@/components/control-ui/ui/card";`,
  `import * as Item from "../components/control-ui/ui/item";`,
  `import { Sidebar } from "@/components/control-ui/ui/sidebar";`,
  `import { Text } from "@/components/control-ui/ui/typography";`,
  `import { Section } from "@/components/section";`,
];

test("flags paint, type, padding, state and !important classes on Control UI components in every linter", () => {
  const lines = [
    ...controlUiImports,
    `export const a = <Button className="hover:bg-muted/30">x</Button>;`,
    `export const b = <Text className={cn("font-mono", active && "text-primary")}>x</Text>;`,
    `export const c = <Sidebar className="group-data-[side=left]:border-r-0" />;`,
    `export const d = <Panel className="shadow-none" />;`,
    "export const e = <Text className={`text-white/75`} />;",
    `export const f = <CardHeader className="gap-1 px-4 py-3" />;`,
    `export const g = <Item.Root className="rounded-md ring-1" />;`,
    `export const h = <Sidebar className="min-h-0! h-full" />;`,
  ];
  expect(flaggedLinesPerLinter("no-component-style-classes", lines)).toEqual(everyLinter([7, 8, 9, 10, 11, 12, 13, 14]));
});

test("leaves layout classes, components from elsewhere, and non-literal classes alone in every linter", () => {
  const lines = [
    ...controlUiImports,
    `export const a = <Panel className="flex flex-col gap-2 w-full min-w-0 mt-4 text-center">x</Panel>;`,
    `export const b = <Section className="bg-card rounded border p-4">x</Section>;`,
    `export const c = <div className="bg-card rounded border p-4">x</div>;`,
    "export const d = <Panel className={styles.border} />;",
    `export const e = <ChevronRightIcon className="text-muted-foreground" />;`,
    `export const f = <Button icon={<span className="rounded bg-muted px-1" />} className="w-full" />;`,
    `export const g = <Panel className="grid-cols-2 items-center order-1 sticky top-0 overflow-hidden gap-x-4 space-y-2" />;`,
    `export const h = <Card className="bg-red-500" />;`,
  ];
  expect(flaggedLinesPerLinter("no-component-style-classes", lines)).toEqual(everyLinter([]));
});

test("flags type rungs and Tailwind font sizes in className on any element in every linter", () => {
  const lines = [
    `export const a = <p className="text-caption text-muted-foreground">x</p>;`,
    `export const b = <span className={cn("font-medium text-micro", "text-muted-foreground")}>x</span>;`,
    `export const c = <h2 className="text-heading-2">x</h2>;`,
    `export const d = <p className="text-body-lg">x</p>;`,
    `export const e = <p className="text-sm text-muted-foreground">x</p>;`,
    `export const f = <h3 className="text-2xl">x</h3>;`,
    `export const g = <span className="text-[13px]">x</span>;`,
    `export const h = <p className="md:text-lg hover:!text-sm">x</p>;`,
  ];
  expect(flaggedLinesPerLinter("no-raw-type-classes", lines)).toEqual(everyLinter([1, 2, 3, 4, 5, 6, 7, 8]));
});

test("leaves alignment, wrapping, colors and look-alike utilities alone in every linter", () => {
  const lines = [
    `export const a = <div className="flex gap-2 text-center text-balance">x</div>;`,
    `export const b = <Text size="micro" tone="muted" className="w-14 shrink-0">x</Text>;`,
    `export const c = <p className="text-bodyx text-labelled">x</p>;`,
    `export const d = <p className="text-[#fff] text-[var(--brand)]">x</p>;`,
    `export const e = <button className="[--cui-button-font-size:var(--text-micro)]">x</button>;`,
  ];
  expect(flaggedLinesPerLinter("no-raw-type-classes", lines)).toEqual(everyLinter([]));
});

test("shipped Grit rules are generated from the class policy", () => {
  for (const [file, source] of Object.entries(gritRules)) {
    expect(readFileSync(path.join(packageRoot, "lint", file), "utf8"), `${file} is stale: run bun lint/grit-rules.ts`).toBe(source);
  }
});
