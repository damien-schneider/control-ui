import { expect, test } from "@playwright/test";
import { DEFAULT_SKIN_ID, MODE_LOCKED_SKINS, THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "@/components/theme";
import { SKIN_META_BY_ID } from "@/components/theme-drawer/presets";
import { waitForReactHydration } from "./browser-test-helpers";

for (const skin of ["refined", "windows-98"] as const) {
  test(`shared ${skin} preset applies before hydration and stays active afterward`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|hydrated/i.test(message.text())) errors.push(message.text());
    });
    await page.addInitScript(
      ({ editorKey, modeKey }) => {
        localStorage.setItem(modeKey, "dark");
        localStorage.setItem(
          editorKey,
          JSON.stringify({
            skin: "refined",
            customSkinId: "saved-custom-skin",
            overrides: { "--radius-control": "13px" },
            dark: { "--background": "oklch(0.2 0.01 50)" },
            knobs: [{ selector: "[data-control-family=button]", tokens: { "--cui-button-radius": "13px" } }],
          }),
        );
      },
      { editorKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY },
    );
    let releaseScripts = () => {};
    const scriptsHeld = new Promise<void>((resolve) => {
      releaseScripts = resolve;
    });
    await page.route("**/_next/**/*.js*", async (route) => {
      await scriptsHeld;
      await route.continue();
    });
    const root = page.locator("html");
    try {
      await page.goto(`/components/button?skin=${skin}`, { waitUntil: "commit" });
      await expect(page.getByRole("heading", { name: "Button", exact: true }).first()).toBeVisible();
      await expect(root).toHaveAttribute("data-skin", skin);
      await expect(root).toHaveAttribute("data-docs-layout", skin === "refined" ? "page" : "contained");
      await expect(root).toHaveClass(skin === "windows-98" ? /^(?!.*\bdark\b)/ : /\bdark\b/);
      expect(await root.evaluate((html) => html.style.getPropertyValue("--radius-control"))).toBe("");
      await expect(page.locator("#control-ui-editor-overrides")).toHaveCount(0);
      releaseScripts();
      await expect
        .poll(() => page.evaluate((editorKey) => localStorage.getItem(editorKey), THEME_EDITOR_STORAGE_KEY))
        .not.toContain("saved-custom-skin");
      const picker = page.getByRole("combobox", { name: "Skin", exact: true });
      await expect(picker).toContainText(SKIN_META_BY_ID[skin].label);
      await expect(root).toHaveAttribute("data-skin", skin);
      expect(await root.evaluate((html) => html.style.getPropertyValue("--radius-control"))).toBe("");
      await expect(page.locator("#control-ui-editor-overrides")).toHaveCount(0);
      expect(errors).toEqual([]);
      await picker.click();
      await page.getByRole("option", { name: "Linear", exact: true }).click();
      await expect(root).toHaveAttribute("data-skin", "linear");
      await expect(root).toHaveClass(/\bdark\b/);
    } finally {
      releaseScripts();
    }
  });
}

test("homepage applies a shared skin preset", async ({ page }) => {
  await page.goto("/?skin=rig&source=shared");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "rig");
});

test("homepage skin picker repaints the site in place and stays put while scrolling", async ({ page }) => {
  await page.goto("/");
  const picker = page.getByRole("group", { name: "Skin for this site" });
  await waitForReactHydration(picker);
  const readingPosition = 1500;
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), readingPosition);
  await expect(picker).toBeInViewport();
  const startBottom = await picker.evaluate((element) => element.getBoundingClientRect().bottom);
  const pickerDrift = async () => Math.abs((await picker.evaluate((element) => element.getBoundingClientRect().bottom)) - startBottom);
  for (const skin of ["windows-98", DEFAULT_SKIN_ID] as const) {
    const option = picker.getByRole("button", { name: SKIN_META_BY_ID[skin].label, exact: true });
    await option.click();
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
    await expect(option).toHaveAttribute("aria-pressed", "true");
    await expect(option).toBeFocused();
    await expect.poll(pickerDrift).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => window.scrollY)).toBe(readingPosition);
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(picker).toBeInViewport();
  await expect.poll(pickerDrift).toBeLessThanOrEqual(1);
});

test("unknown skin query preserves saved edits", async ({ page }) => {
  await page.addInitScript(
    (editorKey) => localStorage.setItem(editorKey, JSON.stringify({ skin: "rig", overrides: { "--radius-control": "13px" } })),
    THEME_EDITOR_STORAGE_KEY,
  );
  await page.goto("/components/button?skin=unknown");
  await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("Rig");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "rig");
  expect(await page.locator("html").evaluate((html) => html.style.getPropertyValue("--radius-control"))).toBe("13px");
});

const skinsWithDistinctInitBranches = ["refined", "windows-98", "rig"] as const;

for (const skin of skinsWithDistinctInitBranches) {
  test(`${skin} restores before application JavaScript loads`, async ({ page }) => {
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
      await page.goto("/components/button", { waitUntil: "commit" });
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
      releaseScripts();
      await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText(SKIN_META_BY_ID[skin].label);
      const afterHydration = await page.locator("html").evaluate((html) => ({
        radius: html.style.getPropertyValue("--radius-control"),
        primary: html.style.getPropertyValue("--primary"),
        background: html.style.getPropertyValue("--background"),
        muted: html.style.getPropertyValue("--muted-foreground"),
      }));
      expect(afterHydration).toEqual(beforeHydration);
      expect(errors).toEqual([]);
    } finally {
      releaseScripts();
    }
  });
}

test("Liquid Metal effects activate on selection and clean up when leaving", async ({ page }) => {
  await page.addInitScript((editorKey) => localStorage.setItem(editorKey, JSON.stringify({ skin: "refined" })), THEME_EDITOR_STORAGE_KEY);
  await page.goto("/components/button");
  const picker = page.getByRole("combobox", { name: "Skin", exact: true });
  await expect(picker).toContainText("Refined");
  await expect(page.locator("[data-liquid-metal]")).toHaveCount(0);
  await waitForReactHydration(picker);
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
