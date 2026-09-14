import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (storageKey) => localStorage.setItem(storageKey, JSON.stringify({ skin: "refined", mode: "light" })),
    THEME_EDITOR_STORAGE_KEY,
  );
});

test("vertical tabs align the indicator and navigate with arrow keys", async ({ page }) => {
  await page.goto("/primitives/tabs");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "refined");
  const list = page.getByRole("tablist", { name: "Settings sections" });
  await expect(list).toHaveAttribute("aria-orientation", "vertical");
  const audio = list.getByRole("tab", { name: "Audio", exact: true });
  const video = list.getByRole("tab", { name: "Video", exact: true });
  await waitForReactHydration(list);
  await list.scrollIntoViewIfNeeded();
  await expect(audio).toBeVisible();
  await expect(video).toBeVisible();
  const audioBounds = await audio.boundingBox();
  const videoBounds = await video.boundingBox();
  if (!(audioBounds && videoBounds)) throw new Error("Settings tabs are not measurable");
  expect(videoBounds.y).toBeGreaterThanOrEqual(audioBounds.y + audioBounds.height);
  await audio.focus();
  await page.keyboard.press("ArrowDown");
  await expect(video).toBeFocused();
  await expect(video).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Video", exact: true })).toContainText("Camera and recording quality.");
  await expect
    .poll(async () => {
      const indicator = await list.locator('[data-slot="indicator"]').boundingBox();
      const selected = await video.boundingBox();
      return indicator && selected ? Math.abs(indicator.y - selected.y) : Number.POSITIVE_INFINITY;
    })
    .toBeLessThan(1);
  await page.keyboard.press("ArrowUp");
  await expect(audio).toBeFocused();
});

test("browser tabs render connected corners and remain keyboard operable", async ({ page }) => {
  await page.goto("/primitives/tabs");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "refined");

  const list = page
    .locator('[data-control-ui="tabs"][data-slot="list"][data-variant="browser"]')
    .filter({ has: page.getByRole("tab", { name: "index.tsx", exact: true }) });
  const root = list.locator("xpath=..");
  const indicator = list.locator('[data-slot="indicator"]');
  const indexTab = list.getByRole("tab", { name: "index.tsx", exact: true });
  const tabsTab = list.getByRole("tab", { name: "tabs.tsx", exact: true });

  await waitForReactHydration(list);
  await list.scrollIntoViewIfNeeded();
  await expect(list).toBeVisible();
  await expect(tabsTab).toHaveAttribute("aria-selected", "true");
  await expect.poll(async () => (await indicator.boundingBox())?.width ?? 0).toBeGreaterThan(0);

  const [activeBox, indicatorBox, shape] = await Promise.all([
    tabsTab.boundingBox(),
    indicator.boundingBox(),
    indicator.evaluate((node) => {
      const activeTab = node.parentElement?.querySelector<HTMLElement>('[aria-selected="true"]');
      const activeTabStyle = activeTab ? getComputedStyle(activeTab) : null;
      return {
        topRadius: activeTabStyle?.borderTopLeftRadius ?? "0px",
        bottomRadius: activeTabStyle?.borderBottomLeftRadius ?? "0px",
      };
    }),
  ]);

  expect(activeBox).not.toBeNull();
  expect(indicatorBox).not.toBeNull();
  expect(indicatorBox?.width ?? 0).toBeGreaterThan(activeBox?.width ?? Number.POSITIVE_INFINITY);
  expect(indicatorBox?.height).toBe(activeBox?.height);
  expect(Number.parseFloat(shape.topRadius)).toBeGreaterThan(0);
  expect(shape.bottomRadius).toBe("0px");

  await indexTab.click();
  await expect(indexTab).toHaveAttribute("aria-selected", "true");
  await expect(root.getByRole("tabpanel", { name: "index.tsx" })).toContainText("Application entry point.");

  await page.keyboard.press("ArrowRight");
  await expect(tabsTab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(tabsTab).toHaveAttribute("aria-selected", "true");
  await expect(root.getByRole("tabpanel", { name: "tabs.tsx" })).toContainText("Browser-style tabs with connected corners.");
});
