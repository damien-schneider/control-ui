import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { MOTION_REDUCED_SKINS } from "@/components/theme";
import { isSkinId } from "@/components/theme-drawer/presets";
import { validateThemeArtifact, validateTokenEntry } from "@/components/theme-drawer/theme-artifact";
import { isColorValuedToken } from "@/components/theme-drawer/token-metadata";
import type { ControlUiThemeArtifactV1, SkinId, TokenValues } from "@/components/theme-drawer/types";
import { THEME_CONTRACT_NAMES } from "@/src/registry/lib/theme-contract";
import { declarations, themeTokenBlocks } from "@/src/registry/sources/control-ui/scripts/contrast-eval.mjs";

const packsRoot = "src/registry/skin-packs";

export function packThemeArtifacts(cwd = process.cwd()): ControlUiThemeArtifactV1[] {
  const packsDir = path.join(cwd, packsRoot);
  return [
    representable(packThemeArtifact(path.join(cwd, "src/registry/sources/control-ui/theme.css"), "none")),
    ...readdirSync(packsDir)
      .filter((entry) => statSync(path.join(packsDir, entry)).isDirectory())
      .sort()
      .map((id) => {
        if (!isSkinId(id)) throw new Error(`${id} is a skin pack directory but not a SkinId`);
        return representable(packThemeArtifact(path.join(packsDir, id, "theme.css"), id));
      }),
  ];
}

function representable(artifact: ControlUiThemeArtifactV1): ControlUiThemeArtifactV1 {
  const keep = (bucket: "shared" | "light" | "dark") =>
    Object.fromEntries(
      Object.entries(artifact.tokens[bucket]).filter(([name, value]) => validateTokenEntry(name, value, bucket, []) !== null),
    );
  const result = validateThemeArtifact({ ...artifact, tokens: { shared: keep("shared"), light: keep("light"), dark: keep("dark") } });
  if (!result.ok) throw new Error(`${artifact.baseSkin} theme.css: ${result.errors.join("; ")}`);
  return result.artifact;
}

function packThemeArtifact(themePath: string, id: SkinId): ControlUiThemeArtifactV1 {
  const shared: TokenValues = {};
  const light: TokenValues = {};
  const dark: TokenValues = {};
  for (const { prelude, body } of themeTokenBlocks(readFileSync(themePath, "utf8"))) {
    for (const [name, value] of declarations(body)) {
      if (!THEME_CONTRACT_NAMES.has(name)) continue;
      if (!isColorValuedToken(name)) shared[name] = value;
      else if (prelude.includes(".dark")) dark[name] = value;
      else light[name] = value;
    }
  }
  return {
    format: "control-ui-theme/v1",
    name: `${id} pack`,
    baseSkin: id,
    reduceMotion: MOTION_REDUCED_SKINS.includes(id),
    tokens: { shared, light, dark },
  };
}
