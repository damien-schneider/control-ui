import { expect, test } from "@playwright/test";
import { findConcentricOffenders } from "./concentric-geometry";
import { serveFixture } from "./fixtures/serve-fixture";
import { SKINS } from "./theme-sweep";

const CORNER_CONTROLS = [
  "slider",
  "slider-default",
  "badge",
  "badge-default",
  "tabs",
  "select",
  "select-ghost",
  "switch",
  "input",
  "button-group",
  "toggle-group",
  "toggle-ghost",
];

for (const skin of SKINS) {
  test(`every toolbar control nests in the composer's corner in the ${skin} skin`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 900, height: 800 });
    const offenders: string[] = [];
    for (const control of CORNER_CONTROLS) {
      await serveFixture(page, "chat-composer-line", { skin, search: `?layout=stacked&corner=${control}` });
      const corner = page
        .getByRole("form", { name: "Composer", exact: true })
        .locator('[data-control-family="chat-composer"][data-slot="tools"] > *')
        .first();
      await expect(corner).toBeVisible();
      const found = await page.evaluate(findConcentricOffenders);
      offenders.push(...found.filter((line) => line.includes("chat-composer/shell")).map((line) => `${control}: ${line}`));
    }
    expect(errors).toEqual([]);
    expect(offenders).toEqual([]);
  });
}
