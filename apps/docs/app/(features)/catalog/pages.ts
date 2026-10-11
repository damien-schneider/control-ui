import { practiceSkills } from "@control-ui/skills";
import { buildSearchItems } from "@/app/(features)/registry-api/search";
import { blockEntries } from "./blocks";
import { componentEntries } from "./components";
import { extensionEntries } from "./extensions";
import { guideEntries } from "./guides";
import { hookEntries, utilEntries } from "./hooks-utils";
import { kitEntries } from "./kits";
import { skinMetas } from "./skins";

export const docsPageManifest = buildSearchItems({
  guides: guideEntries,
  skills: practiceSkills,
  kits: kitEntries,
  blocks: blockEntries,
  components: componentEntries,
  hooks: hookEntries,
  utils: utilEntries,
  extensions: extensionEntries,
  skinPages: skinMetas,
});

export function docsPageForPath(pathname: string) {
  return docsPageManifest.find((page) => page.href === pathname);
}
