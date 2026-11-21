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

test("a ghost badge keeps the outline badge's box but draws no frame until hovered", async ({ page }) => {
  await seedSkin(page, "refined");
  await page.goto("/components/badge");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "refined");
  await page.evaluate(() => {
    for (const variant of ["outline", "ghost"]) {
      const badge = document.createElement("button");
      badge.dataset.controlUi = "badge";
      badge.dataset.controlFamily = "badge";
      badge.dataset.slot = "root";
      badge.dataset.size = "md";
      badge.dataset.color = "neutral";
      badge.dataset.variant = variant;
      badge.textContent = "break";
      badge.style.cssText = "position:fixed;top:8px;left:8px;z-index:2147483647;";
      if (variant === "ghost") {
        badge.style.left = "200px";
      }
      badge.id = `probe-${variant}`;
      document.body.append(badge);
    }
  });
  const read = (id: string) =>
    page.locator(`#${id}`).evaluate((element) => {
      const style = getComputedStyle(element);
      const probe = document.createElement("span");
      probe.style.color = "var(--muted-foreground)";
      document.body.append(probe);
      const muted = getComputedStyle(probe).color;
      probe.remove();
      return {
        box: [element.getBoundingClientRect().width, element.getBoundingClientRect().height],
        background: style.backgroundColor,
        border: style.borderTopColor,
        color: style.color,
        muted,
      };
    });
  const outline = await read("probe-outline");
  const ghost = await read("probe-ghost");

  expect(ghost.box).toEqual(outline.box);
  expect(ghost.background).toBe("rgba(0, 0, 0, 0)");
  expect(ghost.border).toBe("rgba(0, 0, 0, 0)");
  expect(ghost.color).toBe(ghost.muted);

  await page.locator("#probe-ghost").hover();
  expect((await read("probe-ghost")).background).not.toBe("rgba(0, 0, 0, 0)");
});
