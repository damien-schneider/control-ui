import { expect, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";

async function seedSkin(page: Page, skin: string) {
  await page.addInitScript(
    ({ skinKey, themeKey, skinId }) => {
      localStorage.setItem(skinKey, JSON.stringify({ skin: skinId, reduceMotion: true }));
      localStorage.setItem(themeKey, "light");
    },
    { skinKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY, skinId: skin },
  );
}

for (const skin of ["refined", "mastra", "linear", "cuicui"]) {
  test(`${skin}: a badge icon is as tall as the badge's text at every size`, async ({ page }) => {
    await seedSkin(page, skin);
    await page.goto("/components/badge");
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
    const measured = await page.evaluate(() =>
      ["sm", "md"].map((size) => {
        const badge = document.createElement("span");
        badge.dataset.controlUi = "badge";
        badge.dataset.controlFamily = "badge";
        badge.dataset.slot = "root";
        badge.dataset.size = size;
        badge.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 12h16"/></svg>Label';
        document.body.append(badge);
        return {
          size,
          icon: badge.querySelector("svg")?.getBoundingClientRect().height,
          text: Number.parseFloat(getComputedStyle(badge).fontSize),
        };
      }),
    );
    for (const { size, icon, text } of measured) {
      expect(icon, `${size} badge icon`).toBeCloseTo(text, 0);
    }
  });
}
