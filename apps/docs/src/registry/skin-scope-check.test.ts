import { afterAll, describe, expect, mock, spyOn, test } from "bun:test";

let configuredSkinId = "";
mock.module("./skin.config", () => ({
  skin: {
    get id() {
      return configuredSkinId;
    },
  },
}));

let boundaryFor: (id: string) => { background: string } | null = () => null;
const originalDocument = globalThis.document;
const originalGetComputedStyle = globalThis.getComputedStyle;

Object.assign(globalThis, {
  document: {
    documentElement: { dataset: { skin: "installed" } },
    querySelector: (selector: string) => boundaryFor(selector.replace(/^\[data-skin="|"\]$/g, "")),
  },
  getComputedStyle: (element: { background: string }) => ({ getPropertyValue: () => element.background }),
});

const { skinId } = await import("./skin");

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

afterAll(() => {
  Object.assign(globalThis, { document: originalDocument, getComputedStyle: originalGetComputedStyle });
});

describe("skin scope check", () => {
  test("names the mismatch when no element carries the configured skin id", async () => {
    configuredSkinId = "missing-boundary";
    boundaryFor = () => null;
    const error = spyOn(console, "error").mockImplementation(() => {});

    expect(skinId()).toBe("missing-boundary");
    await settle();

    expect(error.mock.calls[0][0]).toContain('no element carries data-skin="missing-boundary"');
    expect(error.mock.calls[0][0]).toContain('"installed"');
    error.mockRestore();
  });

  test("names the missing stylesheet when the boundary declares no tokens", async () => {
    configuredSkinId = "unstyled-boundary";
    boundaryFor = () => ({ background: "  " });
    const error = spyOn(console, "error").mockImplementation(() => {});

    skinId();
    await settle();

    expect(error.mock.calls[0][0]).toContain('declares no tokens for data-skin="unstyled-boundary"');
    error.mockRestore();
  });

  test("stays silent once, and only once, for a scoped skin that paints", async () => {
    configuredSkinId = "painted";
    boundaryFor = () => ({ background: "oklch(1 0 0)" });
    const error = spyOn(console, "error").mockImplementation(() => {});

    skinId();
    await settle();
    boundaryFor = () => null;
    skinId();
    await settle();

    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
