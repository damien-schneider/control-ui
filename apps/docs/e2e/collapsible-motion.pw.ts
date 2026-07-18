import { expect, test } from "@playwright/test";

test("tool activity opening motion unfolds instead of snapping open", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/ai/chat-message");

  const toolActivity = page.locator('[data-control-ui="activity"][data-slot="root"][data-activity-kind="tool"]');
  const triggerLocator = toolActivity.locator('[data-control-ui="activity"][data-slot="trigger"]');
  await expect(triggerLocator).toHaveAttribute("aria-expanded", "false");

  await page.addStyleTag({
    content: '[data-control-ui="activity"][data-slot="content"] { transition-duration: 10s !important; }',
  });
  await triggerLocator.click();
  const panel = toolActivity.locator('[data-control-ui="activity"][data-slot="content"]');
  await expect(panel).toBeAttached();

  const motion = await panel.evaluate((panelElement) => {
    const animations = panelElement.getAnimations().filter((animation) => animation.playState === "running");
    if (animations.length === 0) {
      const styles = getComputedStyle(panelElement);
      throw new Error(
        `Collapsible transition did not start: ${JSON.stringify({
          dataMotion: document.documentElement.dataset.motion,
          transition: styles.transition,
        })}`,
      );
    }
    const duration = Number(animations[0]?.effect?.getTiming().duration);
    const targetHeight = Number.parseFloat(getComputedStyle(panelElement).getPropertyValue("--collapsible-panel-height"));
    const sample = (progress: number) => {
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = duration * progress;
      }
      return panelElement.getBoundingClientRect().height / targetHeight;
    };

    return {
      quarter: sample(0.25),
      half: sample(0.5),
    };
  });

  expect(motion.quarter).toBeGreaterThan(0.15);
  expect(motion.quarter).toBeLessThan(0.7);
  expect(motion.half).toBeLessThan(0.9);
});

test("streaming paint owns only message text", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/ai/chat-message");

  const messageContent = page.locator('[data-control-ui="chat-message"][data-slot="content"].shimmer-text');
  const toolActivity = page.locator('[data-control-ui="activity"][data-slot="root"][data-activity-kind="tool"]');
  const trigger = toolActivity.locator('[data-control-ui="activity"][data-slot="trigger"]');

  await expect(messageContent).toBeVisible();
  await expect(toolActivity).toBeVisible();
  await expect(trigger).toBeVisible();
  expect(await messageContent.locator('[data-control-ui="activity"][data-slot="root"][data-activity-kind="tool"]').count()).toBe(0);

  const messageFill = await messageContent.evaluate((element) => getComputedStyle(element).getPropertyValue("-webkit-text-fill-color"));
  expect(messageFill).toBe("rgba(0, 0, 0, 0)");

  await page.addStyleTag({
    content: '[data-control-ui="activity"][data-slot="content"] { transition-duration: 10s !important; }',
  });
  await trigger.click();

  const panel = toolActivity.locator('[data-control-ui="activity"][data-slot="content"]');
  await expect(panel).toBeAttached();

  const openingFrame = await panel.evaluate((panelElement) => {
    const animations = panelElement.getAnimations().filter((animation) => animation.playState === "running");
    const duration = Number(animations[0]?.effect?.getTiming().duration);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = duration * 0.25;
    }

    const triggerElement = panelElement.parentElement?.querySelector('[data-control-ui="activity"][data-slot="trigger"]');
    const valueElement = panelElement.querySelector('[data-control-ui="activity"][data-slot="detail-content"]');
    const innerElement = panelElement.firstElementChild;
    if (!triggerElement || !valueElement || !innerElement) throw new Error("Tool activity opening anatomy is incomplete");

    const triggerRect = triggerElement.getBoundingClientRect();
    const panelRect = panelElement.getBoundingClientRect();
    const innerRect = innerElement.getBoundingClientRect();
    const valueStyles = getComputedStyle(valueElement);

    return {
      triggerBottom: triggerRect.bottom,
      panelTop: panelRect.top,
      innerTop: innerRect.top,
      valueFill: valueStyles.getPropertyValue("-webkit-text-fill-color"),
    };
  });

  expect(openingFrame.panelTop).toBeCloseTo(openingFrame.triggerBottom, 1);
  expect(openingFrame.innerTop).toBeGreaterThanOrEqual(openingFrame.panelTop);
  expect(openingFrame.valueFill).not.toBe("rgba(0, 0, 0, 0)");
});
