import { expect, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForSkinLayout } from "./browser-test-helpers";

const skinsWithOwnChatSurfaceCode = ["refined", "modern-apple", "cuicui", "xp", "rig"];
const skinsWithOwnComposerShellCode = ["refined", "cuicui"];

async function seedSkin(page: Page, skin: string) {
  await page.addInitScript(
    ({ skinKey, themeKey, skinId, appearance }) => {
      localStorage.setItem(skinKey, JSON.stringify({ skin: skinId, reduceMotion: true }));
      localStorage.setItem(themeKey, appearance);
    },
    { skinKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY, skinId: skin, appearance: skin === "cuicui" ? "dark" : "light" },
  );
}

for (const skin of skinsWithOwnChatSurfaceCode) {
  test(`${skin}: conversation owns one surface and keeps the composer in its scroller`, async ({ page }) => {
    await seedSkin(page, skin);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/templates/coding-agent");
    const preview = page.locator("#preview");
    const thread = preview.locator('[data-control-ui="chat-thread"][data-slot="root"]');
    const layout = preview.locator('[data-control-ui="chat-layout"][data-slot="root"]');
    const composer = thread.locator('[data-control-ui="chat-composer"][data-slot="root"]');
    const shell = composer.locator('[data-slot="shell"]');
    await waitForSkinLayout(page, skin);
    await expect(composer).toBeVisible();
    await expect(layout).toHaveCSS("border-width", "0px");
    await expect(layout).toHaveCSS("box-shadow", "none");
    await expect(thread).toHaveCSS("border-width", "0px");
    await expect(thread).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(composer).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(composer).toHaveCSS("backdrop-filter", "none");
    await expect(preview.getByRole("tabpanel", { name: "Preview", exact: true }).locator("..")).toHaveCSS("border-width", "0px");

    const activeTask = preview.locator('[data-slot="menu-button"][aria-current="page"]');
    const activeTaskLabel = activeTask.locator(":scope > span").first();
    const activeTaskHeight = await activeTask.evaluate((element) => element.getBoundingClientRect().height);
    const authoredLabel = await activeTaskLabel.evaluate((element, longTitle) => {
      const label = element.textContent;
      element.textContent = longTitle;
      return label;
    }, "A task title long enough to overflow its sidebar row ".repeat(4));
    expect(await activeTaskLabel.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    expect(await activeTask.evaluate((element) => element.getBoundingClientRect().height)).toBe(activeTaskHeight);
    await activeTaskLabel.evaluate((element, label) => {
      element.textContent = label;
    }, authoredLabel);

    const dock = thread.locator('[data-slot="dock"]');
    const veil = await dock.evaluate((element) => {
      const style = getComputedStyle(element, "::before");
      return { mask: style.maskImage, background: style.backgroundImage };
    });
    expect(veil.mask).toContain("linear-gradient");
    expect(veil.background).toBe("none");

    await composer.evaluate((element) => {
      element.style.setProperty("--cui-chat-composer-shell-shadow", "none");
      element.style.setProperty("--cui-chat-composer-shell-radius", "3px");
      element.style.setProperty("--cui-chat-composer-shell-background", "oklch(0.6 0.1 250)");
    });
    await expect(shell).toHaveAttribute("data-state", "submitting");
    await expect(shell).toHaveCSS("box-shadow", "none");
    await expect(shell).toHaveCSS("border-radius", "3px");
    await expect(shell).toHaveCSS("background-color", "oklch(0.6 0.1 250)");
    await preview.getByRole("button", { name: "Stop response" }).click();
    await expect(shell).toHaveCSS("box-shadow", "none");

    await preview.getByRole("button", { name: "New task" }).click();
    await composer.getByRole("textbox", { name: "Message" }).fill("A long task description that should wrap in the message. ".repeat(100));
    await composer.getByRole("button", { name: "Send message" }).click();
    const scroller = thread.locator('[data-control-family="scroll-area"][data-slot="viewport"]').first();
    await expect.poll(() => scroller.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeGreaterThan(100);
    for (const fraction of [0, 0.5, 1]) {
      await scroller.evaluate((element, position) => {
        element.scrollTop = (element.scrollHeight - element.clientHeight) * position;
      }, fraction);
      const bottomGap = await dock.evaluate((element) => {
        const viewport = element.closest('[data-control-family="scroll-area"][data-slot="viewport"]');
        if (!viewport) throw new Error("Composer must belong to the conversation scroller");
        return viewport.getBoundingClientRect().bottom - element.getBoundingClientRect().bottom;
      });
      expect(Math.abs(bottomGap)).toBeLessThanOrEqual(1);
    }

    const codeTab = preview.getByRole("tab", { name: "Code", exact: true });
    await codeTab.focus();
    await codeTab.press("Enter");
    await expect(
      preview.getByRole("tabpanel", { name: "Code", exact: true }).locator('[data-control-ui="code"][data-slot="root"]'),
    ).toHaveAttribute("data-chrome", "standalone");
    await page.setViewportSize({ width: 390, height: 844 });
    await preview.getByRole("tab", { name: "Preview", exact: true }).click();
    await expect(composer).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    expect(await shell.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  });
}

for (const skin of skinsWithOwnComposerShellCode) {
  test(`${skin}: attachments stay inside the composer and can be removed by keyboard`, async ({ page }) => {
    await seedSkin(page, skin);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/kits/chat-composer-attachment");
    const preview = page.locator("#preview");
    const rail = preview.locator('[data-control-ui="chat-composer-attachments"][data-slot="root"]');
    await waitForSkinLayout(page, skin);
    await expect(rail).toBeVisible();
    await expect(rail).toHaveCSS("border-width", "0px");
    await expect(rail).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(rail).toHaveCSS("box-shadow", "none");
    const shell = preview.locator('[data-control-ui="chat-composer"][data-slot="shell"]');
    const items = rail.getByRole("listitem");
    await expect(items).toHaveCount(4);
    const geometry = await shell.evaluate((element) => {
      const item = element.querySelector('[data-control-ui="chat-composer-attachment"][data-slot="root"]');
      const textarea = element.querySelector("textarea");
      if (!item || !textarea) throw new Error("Attachment and input must share the composer shell");
      return { itemBottom: item.getBoundingClientRect().bottom, inputTop: textarea.getBoundingClientRect().top };
    });
    expect(geometry.itemBottom).toBeLessThanOrEqual(geometry.inputTop);
    const file = items.filter({ hasText: "Document_de_Synthese_J0025.pdf" });
    await file.evaluate((element) => {
      element.style.setProperty("--cui-chat-composer-attachment-background", "oklch(0.8 0.1 250)");
      element.style.setProperty("--cui-chat-composer-attachment-radius", "3px");
      element.style.setProperty("--cui-chat-composer-attachment-shadow", "0 0 0 3px rgb(255, 0, 0)");
    });
    await expect(file).toHaveCSS("background-color", "oklch(0.8 0.1 250)");
    await expect(file).toHaveCSS("border-radius", "3px");
    await expect(file).toHaveCSS("border-width", "0px");
    await expect(file).toHaveCSS("box-shadow", /rgb\(255, 0, 0\) 0px 0px 0px 3px$/);
    const removeImage = rail.getByRole("button", { name: "Remove vision-reference.png" });
    await removeImage.focus();
    await removeImage.press("Enter");
    await expect(items).toHaveCount(3);
    await expect(items.filter({ hasText: "Document_de_Synthese_J0025.pdf" })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}

test("composer gallery previews fit their grid cells", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1000 });
  await page.goto("/kits");
  for (const id of ["chat-composer", "chat-composer-attachment"]) {
    const card = page.locator(`[data-gallery-item-id="${id}"]`);
    await card.scrollIntoViewIfNeeded();
    const composer = card.locator('[data-control-ui="chat-composer"][data-slot="root"]');
    await expect(composer).toBeVisible();
    const overflow = await composer.evaluate((element) => {
      const host = element.closest("[data-gallery-preview]");
      if (!host) throw new Error("Composer must belong to its preview cell");
      return element.getBoundingClientRect().right - host.getBoundingClientRect().right;
    });
    expect(overflow).toBeLessThanOrEqual(0);
  }
});

test("the composer header belongs to the message field and sits concentric with its corner", async ({ page }) => {
  await seedSkin(page, "refined");
  await page.goto("/templates/coding-agent");
  await waitForSkinLayout(page, "refined");
  const shell = page.locator('#preview [data-control-ui="chat-composer"][data-slot="shell"]');
  const header = shell.locator('[data-slot="header"]');
  await expect(header).toHaveCSS("border-bottom-width", "0px");
  const insets = await shell.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const first = element.querySelector('[data-slot="header"] > *')?.getBoundingClientRect();
    const submit = element.querySelector('[data-slot="submit"]')?.getBoundingClientRect();
    if (!(first && submit)) {
      throw new Error("Composer header content or submit is missing");
    }
    return { start: first.left - box.left, top: first.top - box.top, end: box.right - submit.right, bottom: box.bottom - submit.bottom };
  });
  expect(Math.abs(insets.start - insets.end)).toBeLessThanOrEqual(1);
  expect(Math.abs(insets.top - insets.bottom)).toBeLessThanOrEqual(1);
});

test("components inside the composer header keep their own icon size", async ({ page }) => {
  await seedSkin(page, "refined");
  await page.goto("/templates/coding-agent");
  await waitForSkinLayout(page, "refined");
  const header = page.locator('#preview [data-control-ui="chat-composer"][data-slot="header"]');
  const sizes = await header.evaluate((element) => {
    const svg = '<svg viewBox="0 0 24 24"><path d="M4 12h16"/></svg>';
    const nested = document.createElement("span");
    nested.dataset.controlFamily = "badge";
    nested.dataset.slot = "root";
    nested.dataset.size = "sm";
    nested.innerHTML = svg;
    const loose = document.createElement("span");
    loose.innerHTML = svg;
    element.append(nested, loose);
    const width = (host: Element) => host.querySelector("svg")?.getBoundingClientRect().width;
    const reference = document.createElement("span");
    reference.dataset.controlFamily = "badge";
    reference.dataset.slot = "root";
    reference.dataset.size = "sm";
    reference.innerHTML = svg;
    document.body.append(reference);
    return { nested: width(nested), loose: width(loose), standalone: width(reference) };
  });
  expect(sizes.nested).toBe(sizes.standalone);
  expect(sizes.loose).toBe(14);
});
