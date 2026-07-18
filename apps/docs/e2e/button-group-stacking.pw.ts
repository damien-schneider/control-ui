import { expect, test } from "@playwright/test";

test("selected button keeps shared seams above adjacent focus", async ({ page }) => {
  await page.goto("/primitives/button-group");

  const group = page.getByRole("group", { name: "Text alignment" });
  const left = group.getByRole("button", { name: "Left" });
  const center = group.getByRole("button", { name: "Center" });
  const right = group.getByRole("button", { name: "Right" });
  const seamOwner = (edge: "left" | "right") =>
    center.evaluate((element, selectedEdge) => {
      const rect = element.getBoundingClientRect();
      const x = selectedEdge === "left" ? rect.left + 0.25 : rect.right - 0.25;
      return document
        .elementFromPoint(x, rect.top + rect.height / 2)
        ?.closest("button")
        ?.textContent?.trim();
    }, edge);

  await expect(center).toHaveAttribute("data-active", "true");

  await center.click();
  await page.keyboard.press("Tab");
  await expect(right).toBeFocused();
  expect(await seamOwner("right")).toBe("Center");

  await center.click();
  await page.keyboard.press("Shift+Tab");
  await expect(left).toBeFocused();
  expect(await seamOwner("left")).toBe("Center");
});
