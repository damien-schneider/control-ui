import { generatedSkinContract } from "@/app/(features)/model/generated-skin-contract";
import { updateInstallCode } from "@/app/(features)/model/registry";

const knobFamilies = Object.values(generatedSkinContract.knobs).filter((knobs) => knobs.length > 0);
const countFormat = new Intl.NumberFormat("en-US");

export const knobCountLabel = countFormat.format(knobFamilies.reduce((count, knobs) => count + knobs.length, 0));
export const knobFamilyCountLabel = countFormat.format(knobFamilies.length);

export const exampleKnobFamily = "button";
export const exampleKnob = generatedSkinContract.knobs[exampleKnobFamily]?.find((knob) => knob.name === "--cui-button-radius");
export const exampleKnobSliceHref = `/r/contract/${exampleKnobFamily}.json`;

const installDir = "components/control-ui";
const [diffCommand, overwriteCommand] = updateInstallCode()
  .split("\n")
  .filter((line) => line.startsWith("npx "));

export const updateSession = {
  installDir: `${installDir}/`,
  diff: { script: "npm run control-ui:diff", runs: diffCommand },
  update: {
    script: "npm run control-ui:update",
    runs: overwriteCommand ? `${overwriteCommand} && node ${installDir}/scripts/fix-css-imports.mjs` : undefined,
  },
  changedFiles: [
    { path: "ui/button.tsx", added: 4, removed: 2 },
    { path: "ui/popover.tsx", added: 11, removed: 3 },
    { path: "tool-approval.tsx", added: 6, removed: 6 },
    { path: "docs/button.md", added: 2, removed: 1 },
  ],
} as const;
