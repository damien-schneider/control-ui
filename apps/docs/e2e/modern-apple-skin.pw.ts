import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration } from "./browser-test-helpers";
import { disableAnchorSupport, expectHighlightOn } from "./track-highlight-helpers";

test.use({ launchOptions: { args: ["--disable-webgl"] } });

for (const mode of ["light", "dark"] as const) {
  test.describe(`Modern Apple ${mode}`, () => {
    test.use({ colorScheme: mode });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        ({ skinKey, modeKey, appearance }) => {
          localStorage.setItem(skinKey, JSON.stringify({ skin: "modern-apple", reduceMotion: true }));
          localStorage.setItem(modeKey, appearance);
        },
        { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY, appearance: mode },
      );
    });

    test("danger stays red and ghost buttons remain unfilled", async ({ page }) => {
      await page.goto("/primitives/button");
      await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("Modern Apple");
      const danger = page.getByRole("button", { name: "Danger", exact: true }).first();
      for (const hover of [false, true]) {
        if (hover) await danger.hover();
        const channels = await danger.evaluate((element) => {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas unavailable for color measurement");
          context.fillStyle = getComputedStyle(element).backgroundColor;
          context.fillRect(0, 0, 1, 1);
          return Array.from(context.getImageData(0, 0, 1, 1).data);
        });
        expect(channels[0]).toBeGreaterThan(channels[2] * 2);
      }
      const ghost = page.getByRole("tabpanel", { name: "Preview", exact: true }).getByRole("button", { name: "Ghost", exact: true });
      await expect(ghost).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(ghost).toHaveCSS("backdrop-filter", "none");
    });

    test("sidebar stays flush and the content has no inset frame", async ({ page }) => {
      await page.goto("/primitives/popover");
      await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("Modern Apple");
      const sidebar = page.locator('[data-control-family="sidebar"][data-slot="root"].peer');
      await expect(sidebar).toHaveAttribute("data-variant", "sidebar");
      await expect(sidebar.locator('[data-slot="inner"]')).toHaveCSS("border-radius", "0px");
      await expect(sidebar.locator('[data-slot="container"]')).toHaveCSS("padding", "0px");
      const content = page.locator("[data-docs-content]");
      await expect(content).toHaveCSS("margin", "0px");
      await expect(content).toHaveCSS("border-radius", "0px");
      await expect(content).toHaveCSS("border-width", "0px");
      await expect(content).toHaveCSS("box-shadow", "none");
      const resize = page.getByRole("separator", { name: /Resize sidebar/ });
      await expect(resize).toHaveAttribute("data-resize-ready", "");
      await resize.press("Enter");
      await expect(sidebar).toHaveAttribute("data-state", "collapsed");
      await expect(content).toHaveCSS("margin", "0px");
      await resize.press("Enter");
      await expect(sidebar).toHaveAttribute("data-state", "expanded");
    });

    test("menu indicators stay clear of labels and keyboard selection works", async ({ page }) => {
      await page.goto("/primitives/dropdown-menu");
      await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("Modern Apple");
      const trigger = page.getByRole("button", { name: "Options", exact: true });
      await trigger.focus();
      await page.keyboard.press("Enter");
      const notifications = page.getByRole("menuitemcheckbox", { name: "Notifications", exact: true });
      await expect(notifications).toHaveAttribute("aria-checked", "true");
      const spacing = await notifications.evaluate((element) => {
        const indicator = element.querySelector("svg");
        const label = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
        if (!indicator || !label) throw new Error("Missing menu checkmark or label");
        const range = document.createRange();
        range.selectNode(label);
        return range.getBoundingClientRect().left - indicator.getBoundingClientRect().right;
      });
      expect(spacing).toBeGreaterThanOrEqual(4);
      await page.keyboard.press("Home");
      await page.keyboard.press("Space");
      await expect(notifications).toHaveAttribute("aria-checked", "false");
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      await expect(page.getByText("Notifications off, team", { exact: true })).toBeVisible();
    });

    for (const positioning of ["anchors", "fallback"]) {
      test(`sidebar selection and hover keep distinct fills with ${positioning}`, async ({ page }) => {
        if (positioning === "fallback") await disableAnchorSupport(page);
        await page.goto("/primitives/sidebar");
        await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("Modern Apple");
        const indicator = page.getByRole("combobox", { name: "Menu highlight" });
        await waitForReactHydration(indicator);
        await indicator.selectOption("none");
        const sidebar = page.getByRole("group", { name: "Sidebar", exact: true });
        const agents = sidebar.getByRole("button", { name: "Agents", exact: true });
        const workflows = sidebar.getByRole("button", { name: "Workflows", exact: true });
        await expect(agents).toHaveCSS("font-weight", "600");
        const selectedFill = await agents.evaluate((element) => getComputedStyle(element).backgroundColor);
        await workflows.hover();
        const hoverFill = await workflows.evaluate((element) => getComputedStyle(element).backgroundColor);
        expect(hoverFill).not.toBe(selectedFill);
        const selectedIconColor = await agents.locator("svg").evaluate((element) => getComputedStyle(element).color);
        await expect(workflows.locator("svg")).toHaveCSS("color", selectedIconColor);

        for (const behavior of ["hover", "slide"]) {
          await indicator.focus();
          await indicator.selectOption(behavior);
          const highlight = sidebar.locator('[data-control-family="track-highlight"]').first();
          await workflows.hover();
          await expectHighlightOn(highlight, workflows);
          await expect(highlight).toHaveCSS("background-color", hoverFill);
          await expect(agents).toHaveAttribute("data-active", "true");
          await workflows.click();
          await page.mouse.move(0, 0);
          await expect(workflows).toHaveAttribute("data-active", "true");
          await expect(workflows).toHaveCSS("font-weight", "600");
          await expect(workflows.locator("svg")).toHaveCSS("color", selectedIconColor);
          if (behavior === "slide") {
            await expectHighlightOn(highlight, workflows);
            await expect(highlight).toHaveCSS("background-color", selectedFill);
          } else {
            await expect(workflows).toHaveCSS("background-color", selectedFill);
          }
          await agents.focus();
          await page.keyboard.press("Enter");
          await expect(agents).toHaveAttribute("data-active", "true");
          await expect(sidebar.getByRole("button", { name: "Tools", exact: true })).toBeDisabled();
        }
      });
    }

    test.describe("native glass", () => {
      test("popover keeps a frosted surface and editable fields", async ({ page }) => {
        await page.goto("/primitives/popover");
        await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("Modern Apple");
        const trigger = page.getByRole("button", { name: "Dimensions", exact: true });
        await trigger.click();
        const popover = page.locator('[data-control-ui="popover"][data-slot="content"]');
        await expect(popover.locator("canvas")).toHaveCount(0);
        await expect(popover).not.toHaveCSS("backdrop-filter", "none");
        await expect(popover).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await popover.getByRole("textbox", { name: "Width", exact: true }).fill("480px");
        await expect(popover.getByRole("textbox", { name: "Width", exact: true })).toHaveValue("480px");
        await page.keyboard.press("Escape");
        await expect(trigger).toBeFocused();
      });
    });
  });
}
