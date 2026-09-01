export function buildPagePrompt({ origin, name, pathname }: { origin: string; name: string; pathname: string }) {
  const normalizedOrigin = origin.replace(/\/+$/, "");

  return `Read ${normalizedOrigin}${pathname} — the Control UI "${name}" documentation — and apply it to this repository.

- The catalog is ${normalizedOrigin}/r/agent-index.json and every item carries its own install command; ${normalizedOrigin}/llms.txt indexes the documentation.
- Every command there is written for npm: read the lockfile and run mine instead.
- Installed files are source I own, so take them from the registry and never hand-copy them out of the documentation.
- Tell me what you found and what you will change before changing it.`;
}
