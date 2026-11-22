import { expect, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration, waitForSkinLayout } from "./browser-test-helpers";

async function openKit(page: Page) {
  await page.addInitScript(
    ({ skinKey, themeKey }) => {
      localStorage.setItem(skinKey, JSON.stringify({ skin: "refined", reduceMotion: true }));
      localStorage.setItem(themeKey, "light");
    },
    { skinKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY },
  );
  await page.goto("/kits/chat-composer");
  const model = page.locator("#preview").getByRole("button", { name: /^Model: / });
  await waitForSkinLayout(page, "refined");
  await expect(model).toBeVisible();
  await waitForReactHydration(model);
  return model;
}

test("the model picker opens on a search field, marks the current model, and filters as you type", async ({ page }) => {
  const model = await openKit(page);
  await model.click();

  const search = page.getByRole("combobox", { name: "Search models" });
  await expect(search).toBeFocused();
  const current = page.getByRole("option", { name: /Claude Sonnet 4\.5/ });
  await expect(current).toHaveAttribute("data-current", "");
  await expect(current.locator('[data-slot="check"]')).toBeVisible();
  await expect(page.getByRole("option", { name: /GPT-5/ }).locator('[data-slot="check"]')).toBeHidden();
  await expect(page.getByRole("option")).toHaveCount(3);

  await search.fill("gem");
  await expect(page.getByRole("option")).toHaveCount(1);
  await search.press("Enter");
  await expect(search).toBeHidden();
  await expect(model).toHaveAccessibleName("Model: Gemini 2.5 Pro, Thinking: Medium");
  await expect(model).toBeFocused();

  await model.click();
  await page.getByRole("combobox", { name: "Search models" }).fill("zzz");
  await expect(page.getByText("No models found")).toBeVisible();
});

test("the thinking ramp names only the picked level and keeps the picker open while it changes", async ({ page }) => {
  const model = await openKit(page);
  await model.click();

  const ramp = page.locator('[data-control-ui="thinking-level"][data-slot="track"]');
  const cells = ramp.locator('[data-slot="stop"]');
  await expect(cells).toHaveCount(3);
  await expect(cells.nth(1)).toHaveAttribute("data-picked", "");
  await expect(cells.nth(1).locator('[data-slot="stop-label"]')).toHaveText("Medium");
  await expect(cells.nth(0).locator('[data-slot="stop-label"]')).toHaveCSS("opacity", "0");

  await cells.nth(2).click();
  await expect(cells.nth(2)).toHaveAttribute("data-picked", "");
  await expect(page.getByRole("slider", { name: "Thinking" })).toHaveAttribute("aria-valuetext", "High");
  await expect(model).toHaveAccessibleName("Model: Claude Sonnet 4.5, Thinking: High");
  await expect(ramp).toBeVisible();

  const from = await cells.nth(2).boundingBox();
  const to = await cells.nth(0).boundingBox();
  if (!from || !to) throw new Error("ramp cells have no box");
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 6 });
  await expect(cells.nth(0)).toHaveAttribute("data-picked", "");
  await expect(model).toHaveAccessibleName("Model: Claude Sonnet 4.5, Thinking: High");
  await page.mouse.up();
  await expect(model).toHaveAccessibleName("Model: Claude Sonnet 4.5, Thinking: Low");
});

test("the thinking track nests in the picker's corner the way its model rows do", async ({ page }) => {
  const model = await openKit(page);
  await model.click();
  const geometry = await page.getByRole("dialog").evaluate((dialog) => {
    const measure = (element: Element | null) => {
      if (!element) throw new Error("missing part");
      const rect = element.getBoundingClientRect();
      return { rect, radius: Number.parseFloat(getComputedStyle(element).borderBottomLeftRadius) };
    };
    const popup = measure(dialog);
    const row = measure(dialog.querySelector('[role="option"]'));
    const track = measure(dialog.querySelector('[data-control-family="thinking-level"][data-slot="track"]'));
    const pill = measure(dialog.querySelector('[data-control-family="thinking-level"][data-slot="pill"]'));
    const radius = (part: { rect: DOMRect; radius: number }) => Math.min(part.radius, part.rect.height / 2);
    return {
      popupRadius: popup.radius,
      trackNest: radius(track) + (popup.rect.bottom - track.rect.bottom),
      trackSides: [track.rect.left - row.rect.left, row.rect.right - track.rect.right],
      pillNest: radius(pill) + (track.rect.bottom - pill.rect.bottom),
      trackRadius: radius(track),
    };
  });
  expect(geometry.trackNest).toBeCloseTo(geometry.popupRadius, 0);
  for (const side of geometry.trackSides) expect(Math.abs(side)).toBeLessThanOrEqual(1);
  expect(geometry.pillNest).toBeCloseTo(geometry.trackRadius, 0);
});
