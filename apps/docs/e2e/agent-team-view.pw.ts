import { expect, type Locator, test } from "@playwright/test";

async function boundingBox(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error("Expected a visible bounding box.");
  return box;
}

async function expectPositionDelta(locator: Locator, before: { x: number; y: number }, expected: { x: number; y: number }) {
  await expect
    .poll(async () => {
      const after = await boundingBox(locator);
      return {
        x: Math.round(after.x - before.x),
        y: Math.round(after.y - before.y),
      };
    })
    .toEqual(expected);
}

test("creates, selects, and moves an agent team on Infinite Canvas", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/ai/agent-team-view");

  const canvas = page.getByRole("application", { name: "Infinite canvas" });
  const researchZone = page.getByRole("region", { name: "Research team zone" });
  const researchHandle = researchZone.getByRole("button", { name: "Move and select Research team" });
  await expect(canvas).toBeVisible();
  await expect(researchHandle).toHaveAttribute("aria-pressed", "true");
  await expect(researchZone.getByRole("complementary", { name: "Research team details" })).toBeVisible();

  const productZone = page.getByRole("region", { name: "Product team zone" });
  await productZone.getByRole("button", { name: "Move and select Product team" }).click();
  await expect(productZone.getByRole("complementary", { name: "Product team details" })).toBeVisible();
  await expect(researchZone.getByRole("complementary", { name: "Research team details" })).toHaveCount(0);

  await page.getByRole("button", { name: "New team" }).click();
  const teamPopover = page.locator('[data-control-ui="popover"][data-slot="content"]');
  await teamPopover.getByRole("textbox", { name: "Team name" }).fill("Launch Ops");
  await teamPopover.getByRole("button", { name: "Create team" }).click();

  const launchZone = page.getByRole("region", { name: "Launch Ops team zone" });
  const launchHandle = launchZone.getByRole("button", { name: "Move and select Launch Ops team" });
  await expect(launchZone).toBeVisible();
  await expect(launchHandle).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Add agent" }).click();
  const agentPopover = page.locator('[data-control-ui="popover"][data-slot="content"]');
  await agentPopover.getByRole("textbox", { name: "Agent name" }).fill("Nova");
  await agentPopover.getByRole("textbox", { name: "Role" }).fill("Release coordinator");
  await agentPopover.getByRole("button", { name: "Add agent" }).click();
  await expect(launchZone.getByRole("article", { name: "Nova — Release coordinator" })).toBeVisible();

  const beforePointer = await boundingBox(launchZone);
  const handleBox = await boundingBox(launchHandle);
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox.x + handleBox.width / 2 + 60, handleBox.y + handleBox.height / 2 + 30, { steps: 6 });
  await page.mouse.up();
  await expectPositionDelta(launchZone, beforePointer, { x: 60, y: 30 });

  const beforeKeyboard = await boundingBox(launchZone);
  await launchHandle.focus();
  await launchHandle.press("Shift+ArrowRight");
  await expectPositionDelta(launchZone, beforeKeyboard, { x: 48, y: 0 });
});

test("keeps selected team details and controls usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ai/agent-team-view");

  const canvas = page.getByRole("application", { name: "Infinite canvas" });
  const details = page.getByRole("complementary", { name: "Research team details" });
  await expect(details).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect(page.getByRole("button", { name: "New team" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible();
});
