import { expect, type Page, test } from "@playwright/test";
import { componentEntries } from "../app/(features)/catalog/components";
import { kitEntries } from "../app/(features)/catalog/kits";
import { MODE_LOCKED_SKINS } from "../components/theme";
import { findConcentricOffenders } from "./concentric-geometry";
import { applyTheme, openFirstSurface, portalPages, SKINS } from "./theme-sweep";

const entryPages = [...componentEntries.map((entry) => `/components/${entry.id}`), ...kitEntries.map((entry) => `/kits/${entry.id}`)];

/** Consumer-owned content: the container cannot know where the app places it, so no recipe can fit its corner. */
const CONSUMER_CORNERS = ["/components/sidebar button/trigger in sidebar/inset"];

async function sweepSkins(page: Page, route: string): Promise<string[]> {
  const skinsByOffender = new Map<string, string[]>();
  for (const skin of SKINS) {
    await applyTheme(page, skin, MODE_LOCKED_SKINS[skin] ?? "light");
    for (const offender of await page.evaluate(findConcentricOffenders)) {
      skinsByOffender.set(offender, [...(skinsByOffender.get(offender) ?? []), skin]);
    }
  }
  return [...skinsByOffender]
    .map(([offender, skins]) => `${route} ${offender} [${skins.join(", ")}]`)
    .filter((line) => !CONSUMER_CORNERS.some((exempt) => line.startsWith(exempt)));
}

async function open(page: Page, route: string) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("[data-preview-loading]")).toHaveCount(0, { timeout: 60_000 });
}

for (const route of entryPages) {
  test(`nested corners on ${route} stay concentric across skins`, async ({ page }) => {
    await open(page, route);
    expect(await sweepSkins(page, route)).toEqual([]);
  });
}

test("nested corners on portalled surfaces stay concentric across skins", async ({ page }) => {
  const offenders: string[] = [];
  for (const route of portalPages) {
    await open(page, route);
    expect(await openFirstSurface(page), `${route} opened no portalled surface`).toBe(true);
    offenders.push(...(await sweepSkins(page, route)));
    await page.keyboard.press("Escape");
    await page.mouse.move(0, 0);
  }
  expect(offenders).toEqual([]);
});
