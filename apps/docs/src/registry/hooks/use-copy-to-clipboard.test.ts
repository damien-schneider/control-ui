import { expect, mock, test } from "bun:test";
import { copyTextToClipboard } from "./use-copy-to-clipboard";

test("copyTextToClipboard can write an intentionally empty value", async () => {
  const originalNavigator = globalThis.navigator;
  const writeText = mock(async (_value: string) => {});
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { clipboard: { writeText } },
  });

  try {
    await expect(copyTextToClipboard("")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("");
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});
