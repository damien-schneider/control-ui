import { describe, expect, test } from "bun:test";
import { pairSetKey, stampedAnatomyKeys } from "./stamped-anatomy";

describe("stamped anatomy", () => {
  const source = `
    export function Command({ chrome }) {
      return <div data-control-family="popup" data-slot="root" data-popup-part={chrome === "standalone" ? "surface" : undefined} />;
    }
  `;
  const stamped = stampedAnatomyKeys([{ source }]);

  test("an attribute stamped only on some renders reaches selectors with and without it", () => {
    expect(
      stamped.has(
        pairSetKey([
          ["data-control-family", "popup"],
          ["data-slot", "root"],
          ["data-popup-part", "surface"],
        ]),
      ),
    ).toBe(true);
    expect(
      stamped.has(
        pairSetKey([
          ["data-control-family", "popup"],
          ["data-slot", "root"],
        ]),
      ),
    ).toBe(true);
  });
});
