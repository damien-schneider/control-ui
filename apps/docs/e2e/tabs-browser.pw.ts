import { expect, test } from "@playwright/test";

test("browser tabs render connected corners and remain keyboard operable", async ({ page }) => {
  await page.goto("/primitives/tabs");

  const list = page.locator('[data-control-ui="tabs"][data-slot="list"][data-variant="browser"]');
  const root = list.locator("xpath=..");
  const indicator = list.locator('[data-slot="indicator"]');
  const indexTab = list.getByRole("tab", { name: "index.tsx", exact: true });
  const tabsTab = list.getByRole("tab", { name: "tabs.tsx", exact: true });

  await expect(list).toBeVisible();
  await expect(tabsTab).toHaveAttribute("aria-selected", "true");
  await expect.poll(async () => (await indicator.boundingBox())?.width ?? 0).toBeGreaterThan(0);

  const [activeBox, indicatorBox, shape] = await Promise.all([
    tabsTab.boundingBox(),
    indicator.boundingBox(),
    indicator.evaluate((node) => {
      const indicatorStyle = getComputedStyle(node);
      const activeTab = node.parentElement?.querySelector<HTMLElement>('[aria-selected="true"]');
      const activeTabStyle = activeTab ? getComputedStyle(activeTab) : null;
      return {
        maskImage: indicatorStyle.maskImage,
        topRadius: activeTabStyle?.borderTopLeftRadius ?? "0px",
        bottomRadius: activeTabStyle?.borderBottomLeftRadius ?? "0px",
      };
    }),
  ]);

  expect(activeBox).not.toBeNull();
  expect(indicatorBox).not.toBeNull();
  expect(indicatorBox?.width ?? 0).toBeGreaterThan(activeBox?.width ?? Number.POSITIVE_INFINITY);
  expect(indicatorBox?.height).toBe(activeBox?.height);
  expect(shape.maskImage).not.toBe("none");
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
