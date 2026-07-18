import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// Next switches next-env.d.ts between build and development route-type roots. Stub both shapes so
// `tsc --noEmit` is safe on a fresh checkout; Next replaces them on the next dev/build run.
for (const relativePath of [
  ".next/types/routes.d.ts",
  ".next/types/root-params.d.ts",
  ".next/dev/types/routes.d.ts",
  ".next/dev/types/root-params.d.ts",
]) {
  const file = path.join(process.cwd(), relativePath);
  if (existsSync(file)) continue;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, "// Stub for typecheck on a fresh checkout; replaced by Next.js.\nexport {};\n");
}
