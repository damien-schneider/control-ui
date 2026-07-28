import { expect, type Locator } from "@playwright/test";

export async function waitForReactHydration(locator: Locator) {
  await expect.poll(() => locator.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
}
