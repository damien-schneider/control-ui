import { expect, test } from "@playwright/test";

test("checkbox group rows toggle from their full label hit targets", async ({ page }) => {
  await page.goto("/primitives/checkbox-group");

  const group = page.getByRole("group", { name: "Notification channels" });
  const sms = group.getByRole("checkbox", { name: "SMS" });

  await expect(sms).toHaveAttribute("aria-checked", "false");
  await group.getByText("Critical alerts only", { exact: true }).click();
  await expect(sms).toHaveAttribute("aria-checked", "true");

  const selectAll = group.getByRole("checkbox", { name: "Select all channels" });
  await expect(selectAll).toHaveAttribute("aria-checked", "mixed");
  await group.getByText("Select all channels", { exact: true }).click();

  for (const name of ["Email", "SMS", "Push", "Slack"]) {
    await expect(group.getByRole("checkbox", { name })).toHaveAttribute("aria-checked", "true");
  }
});
