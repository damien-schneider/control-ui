import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("tooltips delay exploration, open neighbors immediately, and reset after leaving", async ({ page }) => {
  await page.goto("/primitives/tooltip");
  const details = page.getByRole("button", { name: "Details", exact: true });
  const save = page.getByRole("button", { name: "Save changes", exact: true });
  const metadata = page.getByRole("tooltip", { name: "Agent run metadata", exact: true });
  const saved = page.getByRole("tooltip", { name: "Save changes", exact: true });
  await waitForReactHydration(details);
  await page.clock.install();
  await page.clock.pauseAt(new Date());

  await details.hover({ force: true });
  await page.clock.runFor(350);
  await expect(metadata).toBeHidden();
  await page.clock.runFor(350);
  await expect(metadata).toBeVisible();

  await save.hover({ force: true });
  await page.clock.runFor(32);
  await expect(saved).toBeVisible();

  await page.mouse.move(0, 0);
  await page.clock.runFor(700);
  await expect(saved).toBeHidden();
  await details.hover({ force: true });
  await page.clock.runFor(350);
  await expect(metadata).toBeHidden();
  await page.clock.runFor(350);
  await expect(metadata).toBeVisible();
});
