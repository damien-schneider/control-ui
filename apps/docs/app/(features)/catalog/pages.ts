import { practiceSkills } from "@control-ui/skills";
import { buildSearchItems } from "@/app/(features)/registry-api/search";
import { blockEntries } from "./blocks";
import { componentEntries } from "./components";
import { extensionEntries } from "./extensions";
import { guideEntries } from "./guides";
import { hookEntries, utilEntries } from "./hooks-utils";
import { primitiveEntries } from "./primitives";
import { skinMetas } from "./skins";

export const docsPageManifest = buildSearchItems({
  guides: guideEntries,
  skills: practiceSkills,
  components: componentEntries,
  blocks: blockEntries,
  primitives: primitiveEntries,
  hooks: hookEntries,
  utils: utilEntries,
  extensions: extensionEntries,
  skinPages: skinMetas,
});

export function docsPageForPath(pathname: string) {
  return docsPageManifest.find((page) => page.href === pathname);
}
