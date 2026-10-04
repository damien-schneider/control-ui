/* biome-ignore-all lint/suspicious/noExplicitAny: Babel parser nodes are the dynamic input boundary for contract tests. */

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";

const appRoot = fileURLToPath(new URL("../../", import.meta.url));
const scannedRoots = ["app", "components", "src/registry"];
const exemptRoots = [
  "components/control-ui",
  "src/registry/knob-contracts",
  "src/registry/skin-packs",
  "src/registry/sources/control-ui/email",
];
const typographyModule = /\/control-ui\/ui\/typography$/;

const tailwindFontSize = /(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl|\[[\d.]+(?:px|rem|em)\])(?![\w-])/;
const headingRung = /(?<![\w-])text-(?:heading-[1-4]|display)(?![\w-])/;
const headingOverride = /(?<![\w-])(?:font-[\w-]+|leading-[\w.[\]-]+|tracking-[\w.[\]-]+|text-balance|text-pretty)(?![\w-])/;
const alignmentOrOverflow = /^text-(?:left|center|right|start|end|justify|nowrap|wrap|ellipsis|clip)$/;

type TypographyComponent = "Heading" | "Text";

function filesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return filesUnder(path);
    return [".ts", ".tsx"].includes(extname(path)) && !/\.(?:test|d)\.tsx?$/.test(entry) && !entry.startsWith("generated-") ? [path] : [];
  });
}

function visit(node: any, callback: (node: any) => void): void {
  if (!node || typeof node !== "object") return;
  callback(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    if (Array.isArray(value)) for (const child of value) visit(child, callback);
    else visit(value, callback);
  }
}

function literalText(node: any): string | undefined {
  if (node.type === "StringLiteral") return node.value;
  if (node.type === "TemplateElement") return node.value.cooked;
  return undefined;
}

function typographyImports(ast: any): Map<string, TypographyComponent> {
  const imports = new Map<string, TypographyComponent>();
  for (const statement of ast.program.body) {
    if (statement.type !== "ImportDeclaration" || !typographyModule.test(statement.source.value)) continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type !== "ImportSpecifier") continue;
      const imported = specifier.imported.name;
      if (imported === "Heading" || imported === "Text") imports.set(specifier.local.name, imported);
    }
  }
  return imports;
}

function literalViolations(text: string): string[] {
  const violations: string[] = [];
  if (tailwindFontSize.test(text)) violations.push("uses a Tailwind font size instead of a text-* rung");
  if (headingRung.test(text) && headingOverride.test(text)) {
    violations.push("overrides a heading rung; the rung already carries face, weight, line-height, and balance");
  }
  return violations;
}

function isTypeToken(token: string, component: TypographyComponent): boolean {
  const utility = token.slice(token.lastIndexOf(":") + 1);
  if (alignmentOrOverflow.test(utility)) return false;
  if (utility.startsWith("leading-")) return component === "Heading";
  return /^(?:text-|font-|tracking-)/.test(utility);
}

function typographyClassNameViolation(element: any, component: TypographyComponent): string | undefined {
  const className = element.attributes.find((attribute: any) => attribute.type === "JSXAttribute" && attribute.name.name === "className");
  if (!className) return undefined;
  const tokens: string[] = [];
  visit(className.value, (child) => {
    const chunk = literalText(child);
    if (chunk !== undefined) tokens.push(...chunk.split(/\s+/).filter(Boolean));
  });
  const typeTokens = tokens.filter((token) => isTypeToken(token, component));
  if (typeTokens.length === 0) return undefined;
  return `${component} className carries type utilities (${typeTokens.join(" ")}); use size, weight, and tone props`;
}

function typeScaleViolations(source: string, filename: string): string[] {
  const ast = parse(source, { sourceType: "module", plugins: filename.endsWith(".tsx") ? ["typescript", "jsx"] : ["typescript"] });
  const components = typographyImports(ast);
  const violations: string[] = [];
  visit(ast, (node) => {
    const location = `${filename}:${node.loc?.start.line ?? 0}`;
    const text = literalText(node);
    if (text !== undefined) {
      violations.push(...literalViolations(text).map((message) => `${location} ${message}`));
      return;
    }
    if (node.type !== "JSXOpeningElement" || node.name.type !== "JSXIdentifier") return;
    const component = components.get(node.name.name);
    const classNameMessage = component ? typographyClassNameViolation(node, component) : undefined;
    if (classNameMessage) violations.push(`${location} ${classNameMessage}`);
  });
  return violations;
}

describe("type scale guardrails", () => {
  test("the docs app and registry stay on the rung utilities and the typography props", () => {
    const exempt = exemptRoots.map((root) => join(appRoot, root));
    const files = scannedRoots
      .flatMap((root) => filesUnder(join(appRoot, root)))
      .filter((path) => !exempt.some((root) => path.startsWith(root)));
    const violations = files.flatMap((path) => typeScaleViolations(readFileSync(path, "utf8"), relative(appRoot, path)));
    expect(violations).toEqual([]);
  });

  test("rejects a Tailwind default or arbitrary font size", () => {
    expect(typeScaleViolations('const a = <p className="mt-2 text-sm" />;', "fixture.tsx")).toHaveLength(1);
    expect(typeScaleViolations('const a = <p className="sm:text-xl" />;', "fixture.tsx")).toHaveLength(1);
    expect(typeScaleViolations('const a = <p className="text-[13px]" />;', "fixture.tsx")).toHaveLength(1);
    expect(typeScaleViolations('const a = <p className="text-body max-w-xl rounded-xl" />;', "fixture.tsx")).toEqual([]);
  });

  test("rejects a type utility beside a heading rung", () => {
    expect(typeScaleViolations('const a = <h2 className="text-heading-2 font-semibold" />;', "fixture.tsx")).toHaveLength(1);
    expect(typeScaleViolations('const a = <h1 className="text-display font-display text-balance" />;', "fixture.tsx")).toHaveLength(1);
    expect(typeScaleViolations('const a = <h2 className="text-heading-3 sm:text-heading-2 tabular-nums" />;', "fixture.tsx")).toEqual([]);
  });

  test("rejects type utilities on Heading and Text className, keeps layout and Text line-height", () => {
    const imports = 'import { Heading, Text } from "@/components/control-ui/ui/typography";\n';
    expect(typeScaleViolations(`${imports}const a = <Heading level={2} className="mt-2 leading-tight" />;`, "fixture.tsx")).toHaveLength(1);
    expect(
      typeScaleViolations(`${imports}const a = <Text className={cn("truncate", "text-muted-foreground")} />;`, "fixture.tsx"),
    ).toHaveLength(1);
    expect(
      typeScaleViolations(`${imports}const a = <Text as="p" className="mt-2 leading-6 truncate text-center" />;`, "fixture.tsx"),
    ).toEqual([]);
    expect(typeScaleViolations('const a = <Text className="text-muted-foreground" />;', "fixture.tsx")).toEqual([]);
  });
});
