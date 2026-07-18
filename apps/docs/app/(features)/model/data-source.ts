import { readFileSync } from "node:fs";
import path from "node:path";

const sourceRootSegments = ["components", "registry", "src"] as const;

type SourceRootSegment = (typeof sourceRootSegments)[number];

function isSourceRootSegment(value: string): value is SourceRootSegment {
  return sourceRootSegments.some((segment) => segment === value);
}

function resolveSourcePath(filePath: string) {
  const [rootSegment, ...segments] = filePath.split("/");

  if (
    !rootSegment ||
    !isSourceRootSegment(rootSegment) ||
    segments.length === 0 ||
    segments.some((segment) => !segment || segment === "..")
  ) {
    throw new Error(`Unsupported docs source path: ${filePath}`);
  }

  switch (rootSegment) {
    case "components":
      return path.join(process.cwd(), "components", ...segments);
    case "registry":
      return path.join(process.cwd(), "registry", ...segments);
    case "src":
      return path.join(process.cwd(), "src", ...segments);
  }
}

function readSource(filePath: string) {
  return readFileSync(/*turbopackIgnore: true*/ resolveSourcePath(filePath), "utf8");
}

export function source(label: string, filePath: string, slot?: string) {
  return {
    label,
    path: filePath,
    code: readSource(filePath),
    slot,
  };
}
