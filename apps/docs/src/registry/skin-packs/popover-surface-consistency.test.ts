import { describe, expect, test } from "bun:test";
import skinContract from "../../../public/r/skin-contract.json";
import { popupParts } from "../sources/control-ui/surface-variants";

describe("semantic surface roles", () => {
  test("the published popup family matches the runtime popup parts", () => {
    expect(Object.keys(skinContract.semanticFamilies.popup).toSorted()).toEqual(popupParts.toSorted());
  });
});
