import { expect, type Locator, test } from "@playwright/test";

async function boundingBox(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error("Expected a visible bounding box.");
  return box;
}

async function expectPositionDelta(locator: Locator, before: { x: number; y: number }, x: number, y: number) {
  await expect
    .poll(async () => {
      const after = await boundingBox(locator);
      return Math.max(Math.abs(after.x - before.x - x), Math.abs(after.y - before.y - y));
    })
    .toBeLessThanOrEqual(1);
}

test("creates and moves an agent team with pointer and keyboard controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/primitives/agent-team-view");

  await page.getByRole("button", { name: "New team" }).click();
  const teamPopover = page.locator('[data-control-ui="popover"][data-slot="content"]');
  await teamPopover.getByRole("textbox", { name: "Team name" }).fill("Launch Ops");
  await teamPopover.getByRole("button", { name: "Create team" }).click();

  const launchZone = page.getByRole("region", { name: "Launch Ops team zone" });
  await expect(launchZone).toBeVisible();

  await page.getByRole("button", { name: "Add agent", exact: true }).click();
  const agentPopover = page.locator('[data-control-ui="popover"][data-slot="content"]');
  await agentPopover.getByRole("textbox", { name: "Agent name" }).fill("Nova");
  await agentPopover.getByRole("textbox", { name: "Role", exact: true }).fill("Release coordinator");
  await agentPopover.getByRole("button", { name: "Add agent", exact: true }).click();
  await expect(page.getByRole("article", { name: "Nova — Release coordinator" })).toBeVisible();

  const moveHandle = page.getByRole("button", { name: /Move Launch Ops team/ });
  const beforePointer = await boundingBox(launchZone);
  const handleBox = await boundingBox(moveHandle);
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox.x + handleBox.width / 2 + 96, handleBox.y + handleBox.height / 2 + 64);
  await page.mouse.up();
  await expectPositionDelta(launchZone, beforePointer, 96, 64);

  const beforeKeyboard = await boundingBox(launchZone);
  await moveHandle.focus();
  await moveHandle.press("Shift+ArrowRight");
  await expectPositionDelta(launchZone, beforeKeyboard, 48, 0);
});
