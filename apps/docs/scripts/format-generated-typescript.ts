import path from "node:path";

const repositoryRoot = path.resolve(process.cwd(), "../..");
const biome = path.join(repositoryRoot, "node_modules/.bin/biome");

export function formatGeneratedTypeScript(filePath: string, source: string): string {
  const result = Bun.spawnSync({
    cmd: [biome, "format", "--stdin-file-path", path.join("apps/docs", filePath)],
    cwd: repositoryRoot,
    stdin: new TextEncoder().encode(source),
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString();
}
