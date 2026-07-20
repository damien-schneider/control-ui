import { expect, type Locator, test } from "@playwright/test";

async function expectSize(locator: Locator, width: number, height: number) {
  await expect
    .poll(async () => {
      return locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      });
    })
    .toEqual({ width, height });
}

test("morphing panel keeps one trigger while moving through declared sizes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/primitives/morphing-panel");

  const panel = page.locator('[data-control-ui="morphing-panel"][data-slot="root"]');
  const trigger = panel.locator('[data-control-ui="morphing-panel"][data-slot="trigger"]');
  const content = panel.locator('[data-control-ui="morphing-panel"][data-slot="content"]');

  await expectSize(panel, 132, 52);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect
    .poll(async () => {
      return panel.evaluate((element) => {
        const panelTrigger = element.querySelector<HTMLElement>('[data-control-ui="morphing-panel"][data-slot="trigger"]');
        if (!panelTrigger) throw new Error("Morphing panel trigger is missing.");

        const panelRect = element.getBoundingClientRect();
        const triggerRect = panelTrigger.getBoundingClientRect();
        const panelRadius = getComputedStyle(element).borderRadius;
        return {
          radiiMatch: panelRadius.length > 0 && panelRadius === getComputedStyle(panelTrigger).borderRadius,
          triggerHeight: Math.round(triggerRect.height),
          triggerOffsetX: Math.round(triggerRect.x - panelRect.x),
          triggerOffsetY: Math.round(triggerRect.y - panelRect.y),
          triggerWidth: Math.round(triggerRect.width),
        };
      });
    })
    .toEqual({
      radiiMatch: true,
      triggerHeight: 52,
      triggerOffsetX: 0,
      triggerOffsetY: 0,
      triggerWidth: 132,
    });
  await trigger.click();
  await expect(panel).toHaveAttribute("data-state", "open");
  await expect(panel).toHaveAttribute("data-last-open-reason", "trigger-press");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expectSize(panel, 320, 240);
  await expect(trigger).toBeFocused();
  await expect(content).toBeVisible();

  await panel.evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error("Morphing panel root is not an HTML element.");
    element.style.setProperty("--radius-panel", "14px");
  });
  await expect
    .poll(async () => {
      return panel.evaluate((element) => {
        const panelContent = element.querySelector<HTMLElement>('[data-control-ui="morphing-panel"][data-slot="content"]');
        if (!panelContent) throw new Error("Morphing panel content is missing.");
        return {
          contentRadius: getComputedStyle(panelContent).borderRadius,
          panelRadius: getComputedStyle(element).borderRadius,
        };
      });
    })
    .toEqual({ contentRadius: "14px", panelRadius: "14px" });

  const surfaceGeometry = await panel.evaluate((element) => {
    const panelContent = element.querySelector<HTMLElement>('[data-control-ui="morphing-panel"][data-slot="content"]');
    const tabs = element.querySelector<HTMLElement>('[data-control-ui="tabs"][data-slot="root"]');
    const activePanel = element.querySelector<HTMLElement>('[data-control-ui="tabs"][data-slot="panel"]:not([hidden]):not([inert])');
    if (!panelContent || !tabs || !activePanel) throw new Error("Morphing panel content is incomplete.");

    const contentStyles = getComputedStyle(panelContent);
    const activePanelStyles = getComputedStyle(activePanel);
    const panelRect = element.getBoundingClientRect();
    const contentRect = panelContent.getBoundingClientRect();
    const tabsRect = tabs.getBoundingClientRect();

    return {
      activePanelPaddingLeft: activePanelStyles.paddingLeft,
      activePanelPaddingRight: activePanelStyles.paddingRight,
      activePanelWidth: Math.round(activePanel.getBoundingClientRect().width),
      contentHeight: Math.round(contentRect.height),
      contentPaddingLeft: contentStyles.paddingLeft,
      contentPaddingRight: contentStyles.paddingRight,
      contentWidth: Math.round(contentRect.width),
      panelHeight: Math.round(panelRect.height),
      panelWidth: Math.round(panelRect.width),
      tabsWidth: Math.round(tabsRect.width),
    };
  });

  expect(surfaceGeometry).toEqual({
    activePanelPaddingLeft: "8px",
    activePanelPaddingRight: "8px",
    activePanelWidth: 320,
    contentHeight: 240,
    contentPaddingLeft: "0px",
    contentPaddingRight: "0px",
    contentWidth: 320,
    panelHeight: 240,
    panelWidth: 320,
    tabsWidth: 320,
  });

  await page.getByRole("tab", { name: "Aspect ratio" }).click();
  await expectSize(panel, 320, 188);
  await expect(page.getByRole("tabpanel", { name: "Aspect ratio" }).getByRole("button", { name: "Apply" })).toBeInViewport();

  await page.getByRole("tab", { name: "Prompt" }).click();
  await expectSize(panel, 320, 240);

  await trigger.click();
  await expectSize(panel, 132, 52);
  await expect(content).toBeAttached();
  await expect(content).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("morphing panel clamps width and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 300, height: 700 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/primitives/morphing-panel");

  const panel = page.locator('[data-control-ui="morphing-panel"][data-slot="root"]');
  const trigger = panel.locator('[data-control-ui="morphing-panel"][data-slot="trigger"]');
  await trigger.click();

  const geometry = await panel.evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error("Morphing panel root is not an HTML element.");
    const panelContent = element.querySelector<HTMLElement>('[data-control-ui="morphing-panel"][data-slot="content"]');
    const tabList = element.querySelector<HTMLElement>('[data-control-ui="tabs"][data-slot="list"]');
    const panelTrigger = element.querySelector<HTMLElement>('[data-control-ui="morphing-panel"][data-slot="trigger"]');
    if (!panelContent || !tabList || !panelTrigger) throw new Error("Morphing panel content is incomplete.");

    const styles = getComputedStyle(element);
    return {
      contentClientWidth: panelContent.clientWidth,
      contentScrollWidth: panelContent.scrollWidth,
      parentWidth: element.parentElement?.getBoundingClientRect().width ?? 0,
      tabListRight: Math.round(tabList.getBoundingClientRect().right),
      transitionDuration: styles.transitionDuration,
      triggerLeft: Math.round(panelTrigger.getBoundingClientRect().left),
      width: element.getBoundingClientRect().width,
    };
  });

  expect(geometry.width).toBeLessThan(320);
  expect(geometry.width).toBeLessThanOrEqual(geometry.parentWidth);
  expect(geometry.contentScrollWidth).toBeLessThanOrEqual(geometry.contentClientWidth);
  expect(geometry.tabListRight).toBeLessThanOrEqual(geometry.triggerLeft);
  expect(geometry.transitionDuration.split(",").every((duration) => Number.parseFloat(duration) === 0)).toBe(true);
});
