export const packageManagerIds = ["npm", "pnpm", "yarn", "bun"] as const;

export type PackageManagerId = (typeof packageManagerIds)[number];

const packageRunners: Record<PackageManagerId, string> = {
  npm: "npx shadcn@latest",
  pnpm: "pnpm dlx shadcn@latest",
  yarn: "yarn dlx shadcn@latest",
  bun: "bunx --bun shadcn@latest",
};

const packageDevCommands: Record<PackageManagerId, string> = {
  npm: "npm run dev",
  pnpm: "pnpm dev",
  yarn: "yarn dev",
  bun: "bun dev",
};

function isLocalRegistry(registryBaseUrl: string) {
  const hostname = new URL(registryBaseUrl).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function developmentCommand(packageManager: PackageManagerId, registryBaseUrl: string) {
  const command = packageDevCommands[packageManager];
  if (!isLocalRegistry(registryBaseUrl)) return command;
  return packageManager === "npm" ? `${command} -- --port 3001` : `${command} --port 3001`;
}

export function normalizeProjectName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 64);

  return normalized || "my-control-ui-app";
}

export function createAppCommand({
  packageManager,
  projectName,
  registryBaseUrl,
}: {
  packageManager: PackageManagerId;
  projectName: string;
  registryBaseUrl: string;
}) {
  const normalizedProjectName = normalizeProjectName(projectName);
  const registryUrl = `${registryBaseUrl.replace(/\/+$/, "")}/r/next-app.json`;

  return [
    packageRunners[packageManager],
    "init",
    "--template next",
    "--defaults",
    `--name ${normalizedProjectName}`,
    "--no-monorepo",
    "--force",
    registryUrl,
    `&& cd ${normalizedProjectName}`,
    `&& ${developmentCommand(packageManager, registryBaseUrl)}`,
  ].join(" ");
}
