import { expect, type Locator, test } from "@playwright/test";

async function edges(locator: Locator) {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      left: box.left,
      right: box.right,
      top: box.top,
      bottom: box.bottom,
      startStartRadius: style.borderStartStartRadius,
      startEndRadius: style.borderStartEndRadius,
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/components/sidebar");
});

test("the icon rail keeps icons and tooltips while the panel collapses away", async ({ page }) => {
  const example = page.getByRole("group", { name: "Double sidebar", exact: true });
  await example.scrollIntoViewIfNeeded();
  const panel = example.locator('[data-slot="panel"]');

  await example.getByRole("button", { name: "Inbox", exact: true }).hover();
  await expect(page.getByRole("tooltip")).toHaveText("Inbox");
  await example.getByRole("button", { name: "Inbox", exact: true }).click();
  await expect(panel.getByRole("heading", { name: "Inbox" })).toBeVisible();

  await example.getByRole("button", { name: "Toggle sidebar" }).click();
  await expect(panel).toBeHidden();
  await expect(panel).toHaveJSProperty("inert", true);
  await example.getByRole("button", { name: "Contacts", exact: true }).hover();
  await expect(page.getByRole("tooltip")).toHaveText("Contacts");
});

test("a content-layer panel shares one card with the inset until the sidebar collapses", async ({ page }) => {
  const example = page.getByRole("group", { name: "Double sidebar joined to content", exact: true });
  await example.scrollIntoViewIfNeeded();
  const panel = example.locator('[data-slot="panel"]');
  const inset = example.locator('[data-slot="inset"]');

  const joinedPanel = await edges(panel);
  const joinedInset = await edges(inset);
  expect(joinedPanel.right).toBeGreaterThanOrEqual(joinedInset.left);
  expect(joinedPanel.top).toBe(joinedInset.top);
  expect(joinedPanel.bottom).toBe(joinedInset.bottom);
  expect(joinedPanel.startStartRadius).not.toBe("0px");
  expect(joinedInset.startStartRadius).toBe("0px");

  await example.getByRole("button", { name: "Toggle sidebar" }).click();
  await expect(panel).toBeHidden();
  await expect.poll(async () => (await edges(inset)).startStartRadius).toBe(joinedPanel.startStartRadius);
});

test("a right sidebar keeps the rail on the outer edge and joins the panel on the inner edge", async ({ page }) => {
  const example = page.getByRole("group", { name: "Double sidebar", exact: true });
  await example.scrollIntoViewIfNeeded();
  await example.getByLabel("Side", { exact: true }).selectOption("right");
  await example.getByLabel("Rail layer", { exact: true }).selectOption("sidebar");
  await example.getByLabel("Panel layer", { exact: true }).selectOption("content");

  const rail = await edges(example.locator('[data-slot="icon-rail"]'));
  const panel = await edges(example.locator('[data-slot="panel"]'));
  const inset = await edges(example.locator('[data-slot="inset"]'));
  expect(rail.left).toBeGreaterThanOrEqual(panel.right);
  expect(panel.left).toBeLessThanOrEqual(inset.right);
  expect(inset.startEndRadius).toBe("0px");
});

test("a fixed double sidebar lays the rail beside the panel on either side", async ({ page }) => {
  const example = page.getByRole("group", { name: "Double sidebar", exact: true });
  await example.scrollIntoViewIfNeeded();
  await example.getByLabel("Collapse", { exact: true }).selectOption("none");
  const rail = example.locator('[data-slot="icon-rail"]');
  const panel = example.locator('[data-slot="panel"]');

  const leftRail = await edges(rail);
  const leftPanel = await edges(panel);
  expect(leftPanel.left).toBeGreaterThanOrEqual(leftRail.right);
  expect(leftPanel.top).toBe(leftRail.top);

  await example.getByLabel("Side", { exact: true }).selectOption("right");
  await expect.poll(async () => (await edges(rail)).left).toBeGreaterThanOrEqual((await edges(panel)).right);
});
