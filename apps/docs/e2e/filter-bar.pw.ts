import { expect, type Locator, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { skinMetas } from "../app/(features)/catalog/skins";
import { waitForReactHydration } from "./browser-test-helpers";

async function openFilters(page: Page) {
  await page.goto("/components/filter-bar");
  const group = page.getByRole("group", { name: "Issue filters", exact: true }).first();
  await waitForReactHydration(group.getByRole("button", { name: "Add filter", exact: true }));
  return group;
}

function issueCount(group: Locator) {
  return group
    .locator("..")
    .getByRole("status")
    .filter({ hasText: /^\d+ of \d+ issues$/ });
}

async function addFilter(page: Page, group: Locator, field: string, operator?: string, value?: string) {
  await group.getByRole("button", { name: "Add filter", exact: true }).click();
  await page.getByRole("option", { name: field, exact: true }).click();
  if (operator) await page.getByRole("option", { name: operator, exact: true }).click();
  if (value) await page.getByRole("option", { name: value, exact: true }).click();
}

test("button entry progresses, edits, cancels and restores focus", async ({ page }) => {
  const group = await openFilters(page);
  const add = group.getByRole("button", { name: "Add filter", exact: true });
  await add.click();
  await expect(page.getByRole("combobox", { name: "Filter field", exact: true })).toBeFocused();
  await page.getByRole("option", { name: "Status", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Filter operator", exact: true })).toBeFocused();
  await expect(group.getByRole("button", { name: "Edit field: Status" })).toBeDisabled();
  await page.getByRole("option", { name: "is", exact: true }).click();
  await page.getByRole("option", { name: "Open", exact: true }).click();
  await expect(add).toBeFocused();
  await expect(issueCount(group)).toHaveText("2 of 4 issues");
  await group.getByRole("button", { name: "Edit value: Open" }).click();
  await page.getByRole("option", { name: "Done", exact: true }).click();
  await expect(issueCount(group)).toHaveText("1 of 4 issues");
  await group.getByRole("button", { name: "Edit field: Status" }).click();
  await page.getByRole("option", { name: "Votes", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(group.getByRole("button", { name: "Edit value: Done" })).toBeVisible();
  await group.getByRole("button", { name: /^Remove filter: Status / }).click();
  await expect(add).toBeFocused();
  await expect(issueCount(group)).toHaveText("4 of 4 issues");
});

test("numeric, boolean, multi-choice and zero-value filters commit correct values", async ({ page }) => {
  const group = await openFilters(page);
  await addFilter(page, group, "Votes", "is");
  const number = page.getByRole("combobox", { name: "Votes value", exact: true });
  await number.fill("Infinity");
  await expect(page.getByText("Enter a number, like 42 or 3.5.", { exact: true })).toBeVisible();
  await expect(issueCount(group)).toHaveText("4 of 4 issues");
  await number.fill("0");
  await number.press("Enter");
  await expect(group.getByRole("button", { name: "Edit value: 0" })).toBeVisible();
  await expect(issueCount(group)).toHaveText("1 of 4 issues");
  await group.getByRole("button", { name: "Clear filters" }).click();
  await addFilter(page, group, "Featured", undefined, "False");
  await expect(issueCount(group)).toHaveText("2 of 4 issues");
  await group.getByRole("button", { name: "Clear filters" }).click();
  await addFilter(page, group, "Labels", "is any of");
  await expect(page.getByRole("button", { name: "Apply", exact: true })).toBeDisabled();
  await page.getByRole("option", { name: "Design", exact: true }).click();
  await page.getByRole("option", { name: "Accessibility", exact: true }).click();
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(group.getByRole("button", { name: "Edit value: Design, Accessibility" })).toBeVisible();
  await expect(issueCount(group)).toHaveText("2 of 4 issues");
  await group.getByRole("button", { name: "Edit value: Design, Accessibility" }).click();
  await page.getByRole("option", { name: "Accessibility", exact: true }).click();
  await page.getByRole("combobox", { name: "Labels value", exact: true }).press("Control+Enter");
  await expect(group.getByRole("button", { name: "Edit value: Design", exact: true })).toBeVisible();
  await expect(issueCount(group)).toHaveText("1 of 4 issues");
  await group.getByRole("button", { name: "Clear filters" }).click();
  await addFilter(page, group, "Labels", "is empty");
  await expect(group.getByRole("button", { name: "Edit operator: is empty" })).toBeVisible();
  await expect(group.getByRole("button", { name: /^Edit value:/ })).toHaveCount(0);
  await expect(issueCount(group)).toHaveText("1 of 4 issues");
});

test("inline typing and button entry coexist with keyboard navigation", async ({ page }) => {
  await openFilters(page);
  const group = page.getByRole("group", { name: "Issue filters", exact: true }).nth(1);
  const input = group.getByPlaceholder("Filter issues…", { exact: true });
  await input.fill("title");
  await input.press("Enter");
  await expect(input).toBeFocused();
  await input.fill("keyboards");
  await input.press("Backspace");
  await expect(input).toHaveValue("keyboard");
  await input.press("Enter");
  await expect(issueCount(group)).toHaveText("1 of 4 issues");
  await expect(input).toBeFocused();
  await input.press("ArrowLeft");
  await expect(group.getByRole("button", { name: /^Remove filter: Title / })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(group.getByRole("button", { name: "Edit value: keyboard" })).toBeFocused();
  await page.keyboard.press("Delete");
  await expect(issueCount(group)).toHaveText("4 of 4 issues");
  await addFilter(page, group, "Status", "is", "Open");
  await expect(group.getByRole("button", { name: "Edit value: Open" })).toBeVisible();
});

test("remote search shows loading, errors and fresh results with stable selected labels", async ({ page }) => {
  await openFilters(page);
  const group = page.getByRole("group", { name: "Assignee filters", exact: true });
  await addFilter(page, group, "Assignee", "is");
  await expect(page.locator('[data-popup-kind="combobox"]').getByText("Loading values…", { exact: true })).toBeVisible();
  await expect(group.getByRole("status")).toHaveText("Loading values…");
  const search = page.getByRole("combobox", { name: "Assignee value", exact: true });
  await search.fill("offline");
  await expect(
    page.locator('[data-popup-kind="combobox"]').getByText("Couldn’t load assignees. Try another search.", { exact: true }),
  ).toBeVisible();
  await expect(group.getByRole("status")).toHaveText("Couldn’t load assignees. Try another search.");
  await expect(search).toHaveAccessibleDescription("Couldn’t load assignees. Try another search.");
  await search.fill("leo");
  await search.fill("maya");
  await expect(page.getByRole("option", { name: "Maya Chen", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: "Leo Martin", exact: true })).toHaveCount(0);
  await page.getByRole("option", { name: "Maya Chen", exact: true }).click();
  await group.getByRole("button", { name: "Edit value: Maya Chen" }).click();
  await search.fill("noah");
  await expect(page.getByRole("option", { name: "Noah Williams", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(group.getByRole("button", { name: "Edit value: Maya Chen" })).toBeVisible();
});

for (const { id: skin } of skinMetas) {
  test(`filters wrap, finish rapid removal, and respect reduced motion with ${skin}`, async ({ page }, testInfo) => {
    await page.addInitScript(
      ({ storageKey, skin: activeSkin }) => localStorage.setItem(storageKey, JSON.stringify({ skin: activeSkin, reduceMotion: true })),
      { storageKey: THEME_EDITOR_STORAGE_KEY, skin },
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    const group = await openFilters(page);
    await addFilter(page, group, "Status", "is", "Open");
    await addFilter(page, group, "Featured", undefined, "False");
    await page.setViewportSize({ width: 390, height: 844 });
    await group.scrollIntoViewIfNeeded();
    const bounds = await group.boundingBox();
    if (!bounds) throw new Error("Filter bar has no layout");
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
    await expect(group.locator('[data-slot="chip"]')).toHaveCount(2);
    const segmentPadding = await group
      .getByRole("button", { name: "Edit field: Status" })
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingInlineStart));
    expect(segmentPadding).toBeGreaterThan(0);
    await group.screenshot({ path: testInfo.outputPath(`${skin}-mobile.png`) });
    await group.getByRole("button", { name: "Clear filters" }).click();
    await expect(group.locator('[data-slot="exit"]')).toHaveCount(0);
    await expect(group.locator('[data-slot="chip"]')).toHaveCount(0);
  });
}

test("draft segments retain their elements through commit and removal settles during motion", async ({ page }, testInfo) => {
  await page.addInitScript(
    (storageKey) => localStorage.setItem(storageKey, JSON.stringify({ skin: "refined", reduceMotion: false })),
    THEME_EDITOR_STORAGE_KEY,
  );
  const group = await openFilters(page);
  await addFilter(page, group, "Status");
  const field = group.getByRole("button", { name: "Edit field: Status" });
  await field.evaluate((element) => element.setAttribute("data-retained", "true"));
  await page.getByRole("option", { name: "is", exact: true }).click();
  await page.getByRole("option", { name: "Open", exact: true }).click();
  await expect(field).toHaveAttribute("data-retained", "true");
  await addFilter(page, group, "Votes", "at least");
  const number = page.getByRole("combobox", { name: "Votes value", exact: true });
  await number.fill("-.5");
  await number.press("Enter");
  await expect(group.getByRole("button", { name: "Edit value: -0.5" })).toBeVisible();
  await group.screenshot({ path: testInfo.outputPath("refined-desktop.png") });
  await group.getByRole("button", { name: /^Remove filter: Status / }).click();
  await group.getByRole("button", { name: "Clear filters" }).click();
  await expect(group.locator('[data-slot="exit"]')).toHaveCount(0);
  await expect(group.locator('[data-slot="chip"]')).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 700 });
  await group.getByRole("button", { name: "Add filter", exact: true }).click();
  const search = page.getByRole("combobox", { name: "Filter field", exact: true });
  const popup = page.locator('[data-popup-kind="combobox"][data-slot="content"]').filter({ has: search });
  const bounds = await popup.boundingBox();
  if (!bounds) throw new Error("Filter popup has no layout");
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(700);
  await popup.screenshot({ path: testInfo.outputPath("refined-mobile-popup.png") });
});
