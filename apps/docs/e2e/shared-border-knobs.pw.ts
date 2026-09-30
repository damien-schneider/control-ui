import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

for (const skin of ["none", "sketch"]) {
  test(`${skin}: shared border width reaches docs surfaces and respects local overrides`, async ({ page }) => {
    await page.addInitScript(
      ({ skinKey, modeKey, selectedSkin }) => {
        localStorage.setItem(skinKey, JSON.stringify({ skin: selectedSkin, reduceMotion: true }));
        localStorage.setItem(modeKey, "light");
      },
      { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY, selectedSkin: skin },
    );
    await page.goto("/get-started", { waitUntil: "domcontentloaded" });
    await waitForReactHydration(page.getByRole("combobox", { name: "Skin", exact: true }));

    const code = page.locator('[data-control-family="code"][data-chrome="standalone"]').first();
    const surfaces = [
      page.getByRole("link", { name: "Install", exact: true }).locator(".."),
      page.locator('[data-control-family="card"][data-slot="root"]').filter({ hasText: "What you should see now" }).first(),
      page.locator('[data-control-family="table-of-contents"][data-slot="root"]').first(),
      page.locator('[data-control-family="theme-toggle"][data-slot="root"]'),
      code,
    ];

    for (const surface of surfaces) {
      await expect(surface).toHaveAttribute("data-control-family");
      if (skin === "sketch") await expect(surface).toHaveCSS("border-image-source", /data:image\/svg\+xml/);
      else await expect(surface).toHaveCSS("border-image-source", "none");
    }

    await page.evaluate(() => document.documentElement.style.setProperty("--control-rim-width", "3px"));
    for (const surface of surfaces) await expect(surface).toHaveCSS("border-top-width", "3px");
    if (skin === "sketch") {
      await expect
        .poll(() => code.evaluate((element) => decodeURIComponent(element.style.getPropertyValue("--sketch-outline-image"))))
        .toContain('stroke-width="2.7"');
    }

    await code.evaluate((element) => {
      element.style.setProperty("--cui-code-border-width", "4px");
      element.style.setProperty("--cui-code-border-color", "rgb(20 90 160)");
    });
    await expect(code).toHaveCSS("border-top-width", "4px");
    await expect(code).toHaveCSS("border-top-color", "rgb(20, 90, 160)");
    if (skin === "sketch") {
      await expect
        .poll(() => code.evaluate((element) => decodeURIComponent(element.style.getPropertyValue("--sketch-outline-image"))))
        .toContain('stroke="rgb(20, 90, 160)"');
    }

    await page.evaluate(() => document.documentElement.style.setProperty("--control-rim-width", "0px"));
    for (const surface of surfaces.filter((candidate) => candidate !== code)) {
      await expect(surface).toHaveCSS("border-top-width", "0px");
      await expect(surface).toHaveCSS("border-image-source", "none");
    }
    await expect(code).toHaveCSS("border-top-width", "4px");
    if (skin === "sketch") {
      const skinPicker = page.getByRole("combobox", { name: "Skin", exact: true });
      await skinPicker.click();
      await page.getByRole("option", { name: "Linear", exact: true }).click();
      await expect(code).toHaveCSS("border-image-source", "none");
      await expect(code).toHaveCSS("border-top-width", "4px");
      await expect.poll(() => code.evaluate((element) => element.style.getPropertyValue("--sketch-outline-slice"))).toBe("");
    }
  });
}

test("Sketch leaves embedded code, dashed borders, and dividers unoutlined", async ({ page }) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, JSON.stringify({ skin: "sketch", reduceMotion: true })),
    THEME_EDITOR_STORAGE_KEY,
  );
  await page.goto("/get-started", { waitUntil: "domcontentloaded" });
  await waitForReactHydration(page.getByRole("combobox", { name: "Skin", exact: true }));
  await page.evaluate(() => {
    const fixture = document.createElement("div");
    fixture.innerHTML = `
      <div id="outlined-card" data-control-family="card" data-slot="root">Outlined</div>
      <div id="embedded-code" data-control-family="code" data-slot="root" data-chrome="embedded">Embedded</div>
      <div id="dashed-card" data-control-family="card" data-slot="root" style="border-style: dashed">Dashed</div>
      <div id="card-divider" data-control-family="card" data-slot="header" style="border-bottom: 1px solid">Divider</div>
    `;
    document.body.append(fixture);
  });
  await expect(page.locator("#outlined-card")).toHaveCSS("border-image-source", /data:image\/svg\+xml/);
  for (const id of ["embedded-code", "dashed-card", "card-divider"]) {
    await expect(page.locator(`#${id}`)).toHaveCSS("border-image-source", "none");
  }
  await expect(page.locator("#dashed-card")).toHaveCSS("border-top-style", "dashed");
  await expect(page.locator("#card-divider")).toHaveCSS("border-bottom-width", "1px");
});
