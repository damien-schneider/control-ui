import { afterAll, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gritRules } from "./lint/grit-rules.mjs";

type Rule = "no-component-style-classes" | "no-component-style-props" | "no-raw-type-classes";

const packageRoot = import.meta.dir;
const binary = (name: string) => path.join(packageRoot, "node_modules/.bin", name);
const biome = path.join(packageRoot, "../../node_modules/.bin/biome");

const consumer = mkdtempSync(path.join(tmpdir(), "cui-lint-"));
mkdirSync(path.join(consumer, "node_modules/@ctrl-ui"), { recursive: true });
symlinkSync(packageRoot, path.join(consumer, "node_modules/@ctrl-ui/react"));
afterAll(() => rmSync(consumer, { recursive: true }));

type Setup = { rule: Rule; importSources?: string[] };

function ruleSetting({ importSources }: Setup) {
  return importSources ? ["error", { importSources }] : "error";
}

function biomeConfig({ rule, importSources }: Setup) {
  if (!importSources) return { plugins: [`./node_modules/@ctrl-ui/react/lint/${rule}.grit`] };
  const sourceArguments = importSources.map((source) => `--import-source=${source}`);
  spawnSync("node", ["node_modules/@ctrl-ui/react/lint/write-grit-rules.mjs", ...sourceArguments, "--out=.control-ui"], { cwd: consumer });
  return { plugins: [`./.control-ui/${rule}.grit`] };
}

function biomeFlaggedLines(config: object, file: string) {
  writeFileSync(
    path.join(consumer, "biome.json"),
    JSON.stringify({ ...config, linter: { rules: { recommended: false } }, css: { parser: { tailwindDirectives: true } } }),
  );
  const result = spawnSync(biome, ["lint", "--max-diagnostics=100", file], { cwd: consumer, encoding: "utf8" });
  return [...`${result.stdout}${result.stderr}`.matchAll(/(\S+):(\d+):\d+ plugin/g)].map((match) =>
    match[1] === file ? Number(match[2]) : -1,
  );
}

const linters = {
  biome(setup: Setup) {
    return biomeFlaggedLines(biomeConfig(setup), "sample.jsx");
  },
  eslint(setup: Setup) {
    writeFileSync(
      path.join(consumer, "eslint.config.mjs"),
      `import controlUi from "@ctrl-ui/react/eslint-plugin";
export default [{ files: ["**/*.jsx"], languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } }, plugins: { "control-ui": controlUi }, rules: { "control-ui/${setup.rule}": ${JSON.stringify(ruleSetting(setup))} } }];`,
    );
    const result = spawnSync(binary("eslint"), ["--format", "json", "sample.jsx"], { cwd: consumer, encoding: "utf8" });
    const [report] = JSON.parse(result.stdout) as [{ messages: { line: number; ruleId: string | null }[] }];
    return report.messages.map((message) => (message.ruleId === `control-ui/${setup.rule}` ? message.line : -1));
  },
  oxlint(setup: Setup) {
    writeFileSync(
      path.join(consumer, ".oxlintrc.json"),
      JSON.stringify({ jsPlugins: ["@ctrl-ui/react/eslint-plugin"], rules: { [`control-ui/${setup.rule}`]: ruleSetting(setup) } }),
    );
    const result = spawnSync(binary("oxlint"), ["--format", "unix", "sample.jsx"], { cwd: consumer, encoding: "utf8" });
    return [...result.stdout.matchAll(/sample\.jsx:(\d+):\d+: .*control-ui\((.+?)\)/g)].map((match) =>
      match[2] === setup.rule ? Number(match[1]) : -1,
    );
  },
};

function flaggedLinesPerLinter(setup: Setup, lines: string[]) {
  writeFileSync(path.join(consumer, "sample.jsx"), lines.join("\n"));
  return Object.fromEntries(Object.entries(linters).map(([name, lint]) => [name, lint(setup)]));
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
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([7, 8, 9, 10, 11, 12, 13, 14]));
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
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([]));
});

test("flags every text-* class but alignment and wrapping on Control UI components in every linter", () => {
  const lines = [
    ...controlUiImports,
    `export const a = <Button className="mb-6 text-xs">x</Button>;`,
    `export const b = <Text className="text-micro" />;`,
    `export const c = <Panel className="min-w-0 text-label" />;`,
    `export const d = <CardHeader className="text-[13px]" />;`,
    `export const e = <Button className={entry.saved ? "text-brand" : ""} />;`,
    `export const f = <Sidebar className="md:text-xl" />;`,
    `export const g = <Item.Root className="text-shadow-sm" />;`,
    `export const h = <Text className="text-centered text-balanced" />;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([7, 8, 9, 10, 11, 12, 13, 14]));
});

test("flags form-state and pseudo-element variants and paint utilities outside the core list in every linter", () => {
  const lines = [
    ...controlUiImports,
    `export const a = <Button className="invalid:mt-1" />;`,
    `export const b = <Sidebar className="starting:translate-y-2" />;`,
    `export const c = <Text className="selection:w-full" />;`,
    `export const d = <Panel className="drop-shadow-md" />;`,
    `export const e = <Panel className="inset-shadow-sm inset-0" />;`,
    `export const f = <Button className="caret-primary accent-brand" />;`,
    `export const g = <Text className="antialiased overline" />;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([7, 8, 9, 10, 11, 12, 13]));
});

test("leaves text alignment, wrapping, truncation and knob classes alone on Control UI components in every linter", () => {
  const lines = [
    ...controlUiImports,
    `export const a = <Panel className="text-left text-center text-right text-justify text-start text-end" />;`,
    `export const b = <Text className="text-wrap text-nowrap text-balance text-pretty text-ellipsis text-clip truncate" />;`,
    `export const c = <Button className="md:text-center [--cui-button-foreground:var(--muted-foreground)]" />;`,
    `export const d = <Panel className="max-md:hidden supports-[display:grid]:grid contrast-more:flex inset-x-0 min-[600px]:w-1/2" />;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([]));
});

test("flags style classes a Control UI className reads from same-module constants in every linter", () => {
  const lines = [
    ...controlUiImports,
    `const TRIGGER_CLASS = "w-full justify-between group-data-[collapsible=icon]:p-0";`,
    `const CELL_CLASS = { code: "font-mono text-label text-muted-foreground", name: "min-w-0" };`,
    "const PAD = `px-4`;",
    "export const a = <Button className={TRIGGER_CLASS}>x</Button>;",
    `export const b = <Text className={cn("align-top", CELL_CLASS[column.kind])}>x</Text>;`,
    "export const c = <Panel className={active ? PAD : undefined} />;",
    "export const d = <CardHeader className={open && CELL_CLASS.code} />;",
    `export const e = <Sidebar className={cn(["flex", PAD])} />;`,
    "export const f = <Item.Root className={LATE} />;",
    `const LATE = "rounded-md";`,
    `export const g = <Button className={cn("flex", { "gap-2": open }, { "bg-muted": active })} />;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([10, 11, 12, 13, 14, 15, 17]));
});

test("leaves layout constants, mutable bindings, call results and outside values alone in every linter", () => {
  const lines = [
    ...controlUiImports,
    `const LAYOUT = "flex w-full gap-2";`,
    `let mutable = "bg-muted";`,
    `const fromCall = cn("bg-muted");`,
    `const PAINT = "bg-muted";`,
    "export const a = <Button className={LAYOUT} />;",
    "export const b = <Button className={mutable} />;",
    "export const c = <Button className={fromCall} />;",
    "export const d = <div className={PAINT} />;",
    "export const e = <Button className={cn(props.className, layout.PAINT)} />;",
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([]));
});

test("flags style classes on the element a Control UI component renders, once, in every linter", () => {
  const lines = [
    ...controlUiImports,
    `import Link from "next/link";`,
    `const TONE = "text-brand";`,
    `export const a = <Button render={<a className="ml-2 shrink-0 text-muted-foreground hover:text-foreground" />} />;`,
    `export const b = <Panel render={<button className="rounded-full bg-foreground/70 text-background opacity-0" />} />;`,
    `export const c = <Button render={(props) => <button {...props} className="px-4" />} />;`,
    `export const d = <Button render={(props) => (<a {...props} className="underline" />)} />;`,
    `export const e = <Button render={(props) => { return <a {...props} className="font-medium" />; }} />;`,
    `export const f = <Button render={<Panel className="shadow-none" />} />;`,
    "export const g = <Button render={<a className={TONE} />} />;",
    `export const h = <Button render={<Link href="/" className="bg-muted">x</Link>} />;`,
    `export const i = <Button className="w-full" render={<a className="rounded-md" />} />;`,
    `export const j = <Button className="bg-muted" render={<a className="rounded-md" />} />;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(
    everyLinter([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18]),
  );
});

test("leaves layout on rendered elements, their children, and render props of other elements alone in every linter", () => {
  const lines = [
    ...controlUiImports,
    `export const a = <Button render={<a href="/" className="w-full" />} />;`,
    `export const b = <Button render={<a href="/"><span className="text-base rounded bg-muted">x</span></a>} />;`,
    `export const c = <Button render={(props) => <a {...props}><span className="bg-muted" /></a>} />;`,
    `export const d = <div render={<a className="bg-muted" />} />;`,
    `export const e = <Section render={<a className="bg-muted" />} />;`,
    `export const f = <Panel><Section render={<a className="bg-muted" />} /></Panel>;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([]));
});

const revealImports = [
  `import { Reveal, RevealScope as Scope } from "@ctrl-ui/react/ui/reveal";`,
  `import { RevealScope } from "@/components/control-ui/ui/reveal";`,
];

test("lets the painted element itself be a paint-free RevealScope, through className, style or render, in every linter", () => {
  const lines = [
    ...revealImports,
    `export const a = <RevealScope className="rounded-md bg-muted p-2">x</RevealScope>;`,
    `export const b = <RevealScope render={<li className="rounded-lg border px-3 hover:bg-accent" />}>x</RevealScope>;`,
    `export const c = <RevealScope style={{ padding: 8, background: "var(--muted)" }}>x</RevealScope>;`,
    "export const d = <RevealScope render={<li style={{ borderRadius: 6 }} />}>x</RevealScope>;",
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([]));
  expect(flaggedLinesPerLinter({ rule: "no-component-style-props" }, lines)).toEqual(everyLinter([]));
});

test("still flags paint on Reveal and part selectors on a RevealScope in every linter", () => {
  const lines = [
    ...revealImports,
    `export const a = <Reveal className="opacity-0 group-hover:opacity-100">x</Reveal>;`,
    `export const b = <Reveal render={<div className="opacity-0" />}>x</Reveal>;`,
    `export const c = <RevealScope className="[&_[data-slot=content]]:opacity-100">x</RevealScope>;`,
    "export const d = <Reveal style={{ opacity: 0 }}>x</Reveal>;",
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([3, 4, 5]));
  expect(flaggedLinesPerLinter({ rule: "no-component-style-props" }, lines)).toEqual(everyLinter([6]));
});

test("follows a local wrapper package once its import path is declared, in every linter", () => {
  const lines = [
    `import { Button } from "@acme/ui/components/button";`,
    `import { Logo } from "@acme/brand/logo";`,
    `export const a = <Button className="bg-primary px-4">x</Button>;`,
    `export const b = <Logo className="bg-primary px-4" />;`,
    `export const c = <Button className="w-full">x</Button>;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes", importSources: ["@acme/ui/components/"] }, lines)).toEqual(
    everyLinter([3]),
  );
});

test("flags arbitrary paint properties and filter utilities on Control UI components in every linter", () => {
  const lines = [
    ...controlUiImports,
    `export const a = <Button className="[background:var(--brand)]" />;`,
    `export const b = <Text className="hover:[color:red]" />;`,
    `export const c = <Panel className="[box-shadow:none] w-full" />;`,
    `export const d = <Sidebar className="grayscale" />;`,
    `export const e = <Item.Root className="blur-sm brightness-90" />;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([7, 8, 9, 10, 11]));
});

test("leaves arbitrary layout properties and knobs on Control UI components alone in every linter", () => {
  const lines = [
    ...controlUiImports,
    `export const a = <Text className="[overflow-wrap:anywhere] [grid-area:main]" />;`,
    `export const b = <Panel className="[--cui-card-padding:0] supports-[color:oklch(0_0_0)]:flex contrast-more:flex" />;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([]));
});

test("flags classes that reach into Control UI parts from any element, once, in every linter", () => {
  const lines = [
    ...controlUiImports,
    `const PARTS = "[&_[data-slot=card-header]]:px-0";`,
    `export const a = <div className="[&_[data-slot=trigger]]:bg-muted">x</div>;`,
    `export const b = <section className="**:data-[slot=icon]:size-3">x</section>;`,
    `export const c = <Section className="*:data-[control-family=button]:rounded-none" />;`,
    "export const d = <div className={PARTS} />;",
    `export const e = <Panel className="[&_[data-slot=card-header]]:px-0" />;`,
    `export const f = <Button render={<a className="[&>[data-control]]:p-0" />} />;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([8, 9, 10, 11, 12, 13]));
});

test("leaves descendant variants that do not target Control UI parts alone in every linter", () => {
  const lines = [
    ...controlUiImports,
    `export const a = <div className="**:selection:bg-muted [&_svg]:size-4 *:min-w-0">x</div>;`,
    `export const b = <div className="has-data-[slot=icon]:pl-2 group-data-[slot=card]:flex **:data-slate-placeholder:top-0">x</div>;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-classes" }, lines)).toEqual(everyLinter([]));
});

test("flags paint properties in style on Control UI components and their rendered elements in every linter", () => {
  const lines = [
    ...controlUiImports,
    `const TINT = { backgroundColor: "var(--brand)" };`,
    `export const a = <Button style={{ color: "red" }}>x</Button>;`,
    `export const b = <Panel style={{ "--cui-card-padding": 0, borderRadius: 0 }} />;`,
    "export const c = <Text style={open ? { fontWeight: 600 } : undefined} />;",
    "export const d = <Sidebar style={TINT} />;",
    `export const e = <Button render={<a style={{ textDecoration: "none" }} />} />;`,
    `export const f = <Item.Root style={{ ["padding"]: 0, WebkitMaskImage: "none" }} />;`,
    "export const g = <Panel style={{ boxShadow }} />;",
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-props" }, lines)).toEqual(everyLinter([8, 9, 10, 11, 12, 13, 14]));
});

test("leaves knobs, layout, and other elements' style alone in every linter", () => {
  const lines = [
    ...controlUiImports,
    `const LAYOUT = { maxHeight: 320, width: "100%" };`,
    `export const a = <Button style={{ "--cui-button-foreground": "var(--muted-foreground)" }} />;`,
    `export const b = <Panel style={{ gridArea: "main", viewTransitionName: "card", columns: 2 }} />;`,
    "export const c = <Sidebar style={LAYOUT} />;",
    `export const d = <div style={{ color: "red" }} />;`,
    `export const e = <Section style={{ color: "red" }} />;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-component-style-props" }, lines)).toEqual(everyLinter([]));
});

test("flags stylesheets that paint Control UI parts, and leaves knobs, layout and own elements alone, in Biome", () => {
  writeFileSync(
    path.join(consumer, "app.css"),
    [
      `[data-slot="card-header"]:hover { color: red; translate: 0 1px; --cui-card-padding: 0; }`,
      `[data-control-family="button"] .brand-mark { color: red; }`,
      `.toolbar { & [data-control-family="button"] { background: none; } }`,
      `[data-slot="item"] { &:hover { padding: 0; } .meta { padding: 0; } }`,
      `[data-slot="icon"] { @apply bg-muted p-1; }`,
      `[data-slot="icon"] { @apply size-4 shrink-0; }`,
      `.brand-mark, [data-control="true"]::after { border-radius: 0; }`,
    ].join("\n"),
  );
  expect(biomeFlaggedLines({ plugins: ["./node_modules/@ctrl-ui/react/lint/no-component-part-css.grit"] }, "app.css")).toEqual([
    1, 3, 4, 5, 7,
  ]);
});

test("the Biome preset runs every component rule and skips installed Control UI source", () => {
  writeFileSync(
    path.join(consumer, "sample.jsx"),
    [
      `import { Button } from "@ctrl-ui/react/ui/button";`,
      `export const a = <Button className="bg-muted" />;`,
      `export const b = <Button style={{ color: "red" }} />;`,
    ].join("\n"),
  );
  const partCss = `[data-control-family="button"] { background: none; }`;
  writeFileSync(path.join(consumer, "app.css"), partCss);
  mkdirSync(path.join(consumer, "components/control-ui/styles"), { recursive: true });
  writeFileSync(path.join(consumer, "components/control-ui/styles/button.css"), partCss);
  const preset = { extends: ["@ctrl-ui/react/biome"] };
  expect(biomeFlaggedLines(preset, "sample.jsx")).toEqual([2, 3]);
  expect(biomeFlaggedLines(preset, "app.css")).toEqual([1]);
  expect(biomeFlaggedLines(preset, "components/control-ui/styles/button.css")).toEqual([]);
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
    `export const i = <p className={cn({ "text-sm": dense })}>x</p>;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-raw-type-classes" }, lines)).toEqual(everyLinter([1, 2, 3, 4, 5, 6, 7, 8, 9]));
});

test("leaves alignment, wrapping, colors and look-alike utilities alone in every linter", () => {
  const lines = [
    `export const a = <div className="flex gap-2 text-center text-balance">x</div>;`,
    `export const b = <Text size="micro" tone="muted" className="w-14 shrink-0">x</Text>;`,
    `export const c = <p className="text-bodyx text-labelled">x</p>;`,
    `export const d = <p className="text-[#fff] text-[var(--brand)]">x</p>;`,
    `export const e = <button className="[--cui-button-font-size:var(--text-micro)]">x</button>;`,
  ];
  expect(flaggedLinesPerLinter({ rule: "no-raw-type-classes" }, lines)).toEqual(everyLinter([]));
});

test("shipped Grit rules are generated from the class policy", () => {
  for (const [file, source] of Object.entries(gritRules())) {
    expect(
      readFileSync(path.join(packageRoot, "lint", file), "utf8"),
      `${file} is stale: run node lint/write-grit-rules.mjs --out lint`,
    ).toBe(source);
  }
});
