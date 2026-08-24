import { themeArtifactBrief } from "@/components/theme-drawer/theme-artifact";
import { createAppCommand } from "./command";

const PLACEHOLDER_PROJECT_NAME = "my-app";

export function buildSetupPrompt({ origin }: { origin: string }) {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const scaffold = createAppCommand({
    packageManager: "npm",
    projectName: PLACEHOLDER_PROJECT_NAME,
    registryBaseUrl: normalizedOrigin,
  });

  return `You are setting up Control UI in this repository, then designing its skin with me.

Read the project first
- If this directory has no package.json, scaffold a new app instead: \`${scaffold}\` — replace ${PLACEHOLDER_PROJECT_NAME} with the name I give you, and npx shadcn@latest with the runner for my package manager.
- Otherwise read package.json, the framework and its version, the Tailwind version, the CSS entry, and components.json if one already exists.
- Tell me what you found and what you will install, then continue directly to Choose the direction with me. This is a status update, not an approval checkpoint; pause only if a required choice or destructive conflict blocks safe installation.

Choose the direction with me
- The skin pack you install owns every token value you never override, so which pack you start from is a design decision. Never pick one silently.
- Ask me this before you install anything, and wait for my answer:
  "Should Control UI match this app's existing look, or do you want a new direction?
   A — Match: I read your current styles and build a skin that sits beside them.
   B — New: tell me the style you want, and attach reference images if you have any."
- If this directory had no interface, skip the question, treat it as B, and ask me for the style and any references.
- On A, read the existing theme tokens, CSS, typography, spacing, components, and representative screens before you choose. Do not ask me to describe what the code already shows.
- On B, get my description and my reference images first. Read references for their visual language, not their literal content.
- Then pick the skin pack whose defaults land closest to that direction, and tell me which one and why. Every pack is a catalog item installed from /r/skin-<id>.json.

Install
- The catalog is ${normalizedOrigin}/r/agent-index.json and every item carries its own install command. ${normalizedOrigin}/llms.txt indexes the documentation.
- Install exactly one skin pack: the one you picked above. Core owns the mechanics and the skin owns every token value, so with no pack installed there is no fallback to render against.
- Install only the components this application needs. Installed files are source I own, so take them from the registry and never hand-copy them out of the documentation.
- Installing moves this app's own dependency versions. List every package it added or changed, and revert any change no installed item required.

Wire it
- Every item appends its own imports to the CSS entry named in components.json. Read that entry afterwards and confirm they landed.
- The registry writes \`../components/…\`. When the CSS entry does not sit beside components/ — app/globals.css with the components under src/ — correct the prefix to \`../src/components/…\` or none of it resolves.
- Stamp data-skin on the root element with the installed pack's id. A missing or misspelled id fails silently: the page keeps its tokens while every portalled surface — popover, dialog, menu, tooltip — renders with none.
- Start the dev server and confirm that a control paints and that one portalled surface opens with its tokens. Do not move on until both do.

${themeArtifactBrief({ origin: normalizedOrigin, discoveryMode: "existing-project" })}`;
}
