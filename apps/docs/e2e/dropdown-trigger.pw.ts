import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

for (const name of ["Full-width trigger", "Composed trigger"]) {
  test(`${name} preserves label and trailing icon layout`, async ({ page }) => {
    await page.goto("/primitives/dropdown-menu");
    const group = page.getByRole("group", { name, exact: true });
    const trigger = group.getByRole("button");
    await waitForReactHydration(trigger);
    await expect(trigger).toHaveAttribute("data-size", "md");
    if (name === "Composed trigger") await expect(trigger).toHaveAttribute("data-variant", "ghost");
    const layout = await trigger.evaluate((element) => {
      const label = element.querySelector(".truncate");
      const icon = element.querySelector("svg");
      if (!label || !icon) throw new Error("Trigger label or icon missing");
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        iconInset: bounds.right - icon.getBoundingClientRect().right,
        padding: Number.parseFloat(style.paddingRight),
        labelWidth: label.clientWidth,
        textWidth: label.scrollWidth,
        withinButton: label.getBoundingClientRect().right <= icon.getBoundingClientRect().left,
      };
    });
    expect(Math.abs(layout.iconInset - layout.padding)).toBeLessThan(2);
    expect(layout.withinButton).toBe(true);
    if (name === "Composed trigger") expect(layout.textWidth).toBeGreaterThan(layout.labelWidth);
    await trigger.click({ position: { x: 8, y: 12 } });
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await trigger.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
}

test("open appearance survives hover and respects skin knobs", async ({ page }) => {
  await page.goto("/primitives/dropdown-menu");
  const trigger = page.getByRole("group", { name: "Full-width trigger", exact: true }).getByRole("button");
  await waitForReactHydration(trigger);
  await page.addStyleTag({ content: "* { transition: none !important; }" });
  await trigger.click();
  await expect(trigger).toHaveAttribute("data-popup-open", "");
  const hoveredBackground = await trigger.evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.mouse.move(0, 0);
  await expect(trigger).toHaveCSS("background-color", hoveredBackground);
  await page.addStyleTag({
    content: `[data-control-family="button"] {
    --cui-button-open-background: var(--primary);
    --cui-button-open-foreground: var(--primary-foreground);
    --cui-button-open-shadow: inset 0 2px 3px var(--foreground);
  }`,
  });
  const expected = await trigger.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.getPropertyValue("--cui-button-open-background").trim(),
      foreground: style.getPropertyValue("--cui-button-open-foreground").trim(),
    };
  });
  await expect(trigger).toHaveCSS("background-color", expected.background);
  await expect(trigger).toHaveCSS("color", expected.foreground);
  await expect(trigger).toHaveCSS("box-shadow", /inset/);
  await trigger.hover();
  await expect(trigger).toHaveCSS("background-color", expected.background);
  await expect(trigger).toHaveCSS("box-shadow", /inset/);
  await page.keyboard.press("Escape");
  await expect(trigger).not.toHaveCSS("box-shadow", /inset 0px 2px 3px/);
});
