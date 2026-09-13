import type { BlockId, ComponentId, PrimitiveId } from "../../model/types";
import { agentsCompositions } from "./agents";
import { blocksCompositions } from "./blocks";
import { displayCompositions } from "./display";
import { formsCompositions } from "./forms";
import { navigationCompositions } from "./navigation";
import { overlaysCompositions } from "./overlays";
import type { CatalogComposition } from "./types";

export const catalogCompositions = {
  ...agentsCompositions,
  ...blocksCompositions,
  ...displayCompositions,
  ...formsCompositions,
  ...navigationCompositions,
  ...overlaysCompositions,
} satisfies Record<ComponentId | PrimitiveId | BlockId, CatalogComposition>;
