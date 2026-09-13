import { expect, test } from "@playwright/test";
import { DEFAULT_SKIN_ID, MODE_LOCKED_SKINS, THEME_EDITOR_STORAGE_KEY, THEME_INIT_SKIN_IDS, THEME_STORAGE_KEY } from "@/components/theme";

for (const skin of THEME_INIT_SKIN_IDS) {
  test(`${skin} restores before application JavaScript loads`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|hydrated/i.test(message.text())) errors.push(message.text());
    });
    await page.addInitScript(
      ({ skinId, editorKey, modeKey }) => {
        localStorage.setItem(modeKey, "dark");
        localStorage.setItem(
          editorKey,
          JSON.stringify({
            skin: skinId,
            reduceMotion: true,
            overrides: { "--radius-control": "13px" },
            light: { "--primary": "oklch(0.65 0.15 40)" },
            dark: { "--background": "oklch(0.2 0.01 50)" },
            textFixes: { "--muted-foreground": "#777777" },
          }),
        );
      },
      { skinId: skin, editorKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY },
    );
    let releaseScripts = () => {};
    const scriptsHeld = new Promise<void>((resolve) => {
      releaseScripts = resolve;
    });
    await page.route("**/_next/**/*.js*", async (route) => {
      await scriptsHeld;
      await route.continue();
    });
    try {
      await page.goto("/primitives/button", { waitUntil: "commit" });
      await expect(page.getByRole("heading", { name: "Button", exact: true }).first()).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
      await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
      await expect(page.locator("html")).toHaveClass(MODE_LOCKED_SKINS[skin] === "light" ? /^(?!.*\bdark\b)/ : /\bdark\b/);
      const beforeHydration = await page.locator("html").evaluate((html) => ({
        radius: html.style.getPropertyValue("--radius-control"),
        primary: html.style.getPropertyValue("--primary"),
        background: html.style.getPropertyValue("--background"),
        muted: html.style.getPropertyValue("--muted-foreground"),
      }));
      expect(beforeHydration.radius).toBe("13px");
      expect(beforeHydration.primary).not.toBe("");
      expect(beforeHydration.muted).not.toBe("");
      if (MODE_LOCKED_SKINS[skin] !== "light") expect(beforeHydration.background).toBe("oklch(0.2 0.01 50)");
      if (skin === "rig") await page.screenshot({ path: testInfo.outputPath("before-hydration.png") });
      releaseScripts();
      await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText(
        skin === "windows-98" ? "Windows 98" : new RegExp(skin.replaceAll("-", "[ -]"), "i"),
      );
      const afterHydration = await page.locator("html").evaluate((html) => ({
        radius: html.style.getPropertyValue("--radius-control"),
        primary: html.style.getPropertyValue("--primary"),
        background: html.style.getPropertyValue("--background"),
        muted: html.style.getPropertyValue("--muted-foreground"),
      }));
      expect(afterHydration).toEqual(beforeHydration);
      expect(errors).toEqual([]);
      if (skin === "rig") await page.screenshot({ path: testInfo.outputPath("after-hydration.png") });
    } finally {
      releaseScripts();
    }
  });
}

for (const saved of ["not json", "null", '{"skin":"toString"}']) {
  test(`invalid saved theme ${saved} falls back before hydration`, async ({ page }) => {
    await page.addInitScript(({ editorKey, value }) => localStorage.setItem(editorKey, value), {
      editorKey: THEME_EDITOR_STORAGE_KEY,
      value: saved,
    });
    await page.route("**/_next/**/*.js*", (route) => route.abort());
    await page.goto("/primitives/button");
    await expect(page.locator("html")).toHaveAttribute("data-skin", DEFAULT_SKIN_ID);
    await expect(page.getByRole("heading", { name: "Button", exact: true }).first()).toBeVisible();
  });
}

test("blocked storage still honors the system color scheme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage is disabled", "SecurityError");
      },
    });
  });
  await page.route("**/_next/**/*.js*", (route) => route.abort());
  await page.goto("/primitives/button");
  await expect(page.locator("html")).toHaveAttribute("data-skin", DEFAULT_SKIN_ID);
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
});

test("Liquid Metal effects activate on selection and clean up when leaving", async ({ page }) => {
  await page.addInitScript((editorKey) => localStorage.setItem(editorKey, JSON.stringify({ skin: "refined" })), THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/button");
  const picker = page.getByRole("combobox", { name: "Skin", exact: true });
  await expect(picker).toContainText("Refined");
  await expect(page.locator("[data-liquid-metal]")).toHaveCount(0);
  await picker.focus();
  await picker.press("Enter");
  await page.getByRole("option", { name: "Liquid metal", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "liquid-metal");
  await expect(page.locator('[data-liquid-metal="active"]').first()).toBeVisible();
  await picker.click();
  await page.getByRole("option", { name: "Refined", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "refined");
  await expect(page.locator("[data-liquid-metal]")).toHaveCount(0);
  await expect(page.locator('[data-extension-node="liquid-metal-canvas"]')).toHaveCount(0);
});
