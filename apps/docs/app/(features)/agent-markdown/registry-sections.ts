export function installSection(commands: readonly string[]) {
  return `## Install\n\n${commands.map((command) => `\`\`\`bash\n${command}\n\`\`\``).join("\n\n")}`;
}

export function dependencySections(deps: { dependencies: readonly string[]; registryDependencies: readonly string[] }) {
  const list = (items: readonly string[]) => items.map((item) => `- \`${item}\``).join("\n");
  return [
    deps.dependencies.length > 0 ? `## npm dependencies\n\n${list(deps.dependencies)}` : "",
    deps.registryDependencies.length > 0 ? `## Registry dependencies\n\n${list(deps.registryDependencies)}` : "",
  ].filter(Boolean);
}
