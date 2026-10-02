import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

const faces = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤥",
];
const emojiData = [
  ...faces.map((emoji, index) => ({ emoji, label: `Face ${index + 1}`, group: 0, version: 1, tags: ["face"] })),
  { emoji: "🐶", label: "Dog face", group: 3, version: 1, tags: ["dog", "animal"] },
  { emoji: "🐱", label: "Cat face", group: 3, version: 1, tags: ["cat", "animal"] },
];
const messages = {
  groups: [
    { key: "smileys-emotion", order: 0, message: "Smileys and emotion" },
    { key: "animals-nature", order: 3, message: "Animals and nature" },
  ],
  subgroups: [],
  skinTones: [],
};

test.setTimeout(90_000);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (storageKey) => localStorage.setItem(storageKey, JSON.stringify({ skin: "refined", mode: "light" })),
    THEME_EDITOR_STORAGE_KEY,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/*emojibase-data*/**", async (route) => {
    const body = route.request().url().endsWith("/messages.json") ? messages : emojiData;
    await route.fulfill({ json: body });
  });
});

test("switches panels with intermediate heights, selects a tinted icon, and restores trigger focus", async ({ page }) => {
  await page.goto("/primitives/emoji-icon-picker");
  const trigger = page.getByRole("button", { name: "Choose item emoji or icon" });
  await waitForReactHydration(trigger);
  await trigger.click();
  await expect(page.getByRole("toolbar", { name: "Emoji categories" })).toBeVisible();
  const viewport = page.locator('[data-control-ui="popover"][data-slot="viewport"]');
  const popup = page.locator('[data-control-ui="popover"][data-slot="content"]');
  await expect
    .poll(() =>
      popup.evaluate((element) => element.getAnimations({ subtree: true }).some((animation) => animation.playState === "running")),
    )
    .toBe(false);
  const previousHeight = await viewport.evaluate((element) => element.getBoundingClientRect().height);
  const heights = await page.getByRole("tab", { name: "Icons", exact: true }).evaluate(async (tab) => {
    if (!(tab instanceof HTMLButtonElement)) throw new Error("Icon tab must be a button.");
    const pickerViewport = tab.closest('[data-slot="viewport"]');
    if (!pickerViewport) throw new Error("Picker viewport is missing.");
    const samples: number[] = [];
    tab.click();
    for (let frame = 0; frame < 24; frame += 1) {
      await new Promise(requestAnimationFrame);
      samples.push(pickerViewport.getBoundingClientRect().height);
    }
    return samples;
  });
  const finalHeight = heights[heights.length - 1];
  expect(finalHeight).toBeLessThan(previousHeight - 40);
  expect(heights.some((height) => height < previousHeight - 1 && height > finalHeight + 1)).toBe(true);

  await page.getByRole("radio", { name: "Blue", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Blue", exact: true })).toBeChecked();
  await expect(page.getByRole("button", { name: "Wallet", exact: true })).toHaveCSS("color", "oklch(0.59 0.23 255)");
  await page.getByRole("searchbox", { name: "Search icons" }).fill("finance");
  await expect(page.getByRole("toolbar", { name: "Icons", exact: true }).getByRole("button")).toHaveCount(1);
  await page.getByRole("button", { name: "Wallet", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Search icons" })).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger.locator("svg")).toHaveCSS("color", "oklch(0.59 0.23 255)");
});

test("icon search recovers from empty results and supports both grid axes", async ({ page }) => {
  await page.goto("/primitives/icon-picker");
  const search = page.getByRole("searchbox", { name: "Search icons" });
  await waitForReactHydration(search);
  await search.fill("no-such-icon");
  await expect(page.locator('[data-control-family="icon-picker"][data-slot="empty"]')).toHaveText("No icons found.");
  await search.fill("");
  const folder = page.getByRole("button", { name: "Folder", exact: true });
  await folder.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: "Music", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  const popcorn = page.getByRole("button", { name: "Popcorn", exact: true });
  await expect(popcorn).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(popcorn).toHaveAttribute("aria-pressed", "true");
});

test("category navigation reaches virtualized emoji and recent selection closes the popup", async ({ page }) => {
  await page.goto("/primitives/emoji-icon-picker");
  const trigger = page.getByRole("button", { name: "Choose item emoji or icon" });
  await waitForReactHydration(trigger);
  await trigger.click();
  const categories = page.getByRole("toolbar", { name: "Emoji categories" });
  await expect(categories).toBeVisible();
  await categories.getByRole("button", { name: "Animals and nature" }).click();
  const emojiViewport = page.locator('[data-control-ui="emoji-picker"][data-slot="content"]');
  await expect.poll(() => emojiViewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(100);
  await expect(emojiViewport.getByRole("gridcell", { name: "Cat face" })).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Search emoji" });
  await search.fill("cat");
  await expect(categories).toBeHidden();
  await expect(page.getByRole("toolbar", { name: "Recently used" })).toBeHidden();
  await expect(emojiViewport.getByRole("gridcell", { name: "Cat face" })).toBeVisible();
  await search.fill("");
  await page.getByRole("toolbar", { name: "Recently used" }).getByRole("button", { name: "Dog face" }).click();
  await expect(trigger).toContainText("🐶");
  await expect(trigger).toBeFocused();
});

test("failed emoji loading provides a working retry", async ({ page }) => {
  await page.unroute("**/*emojibase-data*/**");
  await page.route("**/*emojibase-data*/**", (route) => route.abort());
  await page.goto("/primitives/emoji-picker");
  const trigger = page.getByRole("button", { name: "Add reaction", exact: true });
  await waitForReactHydration(trigger);
  await trigger.click();
  await expect(page.locator('[data-control-family="emoji-picker"][data-slot="error"]')).toContainText("Couldn’t load emoji.");
  await page.unroute("**/*emojibase-data*/**");
  await page.route("**/*emojibase-data*/**", (route) =>
    route.fulfill({ json: route.request().url().endsWith("/messages.json") ? messages : emojiData }),
  );
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator('[data-control-family="emoji-picker"][data-slot="error"]')).toBeHidden();
  await expect(page.getByRole("toolbar", { name: "Emoji categories" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "Face 1", exact: true })).toBeVisible();
});

test("chat reactions expand within the same popup and toggle the selected reaction", async ({ page }) => {
  await page.goto("/primitives/emoji-picker");
  const trigger = page.getByRole("button", { name: "React to Maya’s message" });
  await waitForReactHydration(trigger);
  await trigger.click();
  await page.getByRole("button", { name: "Thumbs up", exact: true }).click();
  const reaction = page.getByRole("button", { name: "👍, your reaction" });
  await expect(reaction).toHaveAttribute("aria-pressed", "true");
  await reaction.click();
  await expect(reaction).toBeHidden();
  await trigger.click();
  const viewport = page.locator('[data-control-ui="popover"][data-slot="viewport"]');
  const compactHeight = await viewport.evaluate((element) => element.getBoundingClientRect().height);
  await page.getByRole("button", { name: "More emoji" }).click();
  await expect(page.getByRole("searchbox", { name: "Search emoji" })).toBeFocused();
  await expect.poll(() => viewport.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(compactHeight + 200);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("the mobile picker fits the viewport and reduced motion resizes immediately", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/primitives/emoji-icon-picker");
  const trigger = page.getByRole("button", { name: "Choose item emoji or icon" });
  await waitForReactHydration(trigger);
  await trigger.click();
  await page.getByRole("tab", { name: "Icons", exact: true }).click();
  const popup = page.locator('[data-control-ui="popover"][data-slot="content"]');
  const bounds = await popup.boundingBox();
  if (!bounds) throw new Error("Picker popup has no rendered bounds.");
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await expect(page.locator('[data-control-ui="popover"][data-slot="viewport"]')).toHaveCSS("transition-duration", "0s");
  await page.getByRole("searchbox", { name: "Search icons" }).fill("plane");
  await page.getByRole("button", { name: "Plane", exact: true }).click();
  await expect(trigger).toBeFocused();
});
