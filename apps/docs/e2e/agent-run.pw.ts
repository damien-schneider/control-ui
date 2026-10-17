import { expect, type Locator, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";

async function approvalLook(preview: Locator) {
  const root = preview.locator('[data-control-ui="tool-approval"][data-slot="root"]');
  const footer = root.locator('[data-slot="footer"]');
  return {
    rootPadding: await root.evaluate((element) => getComputedStyle(element).paddingTop),
    footerBorder: await footer.evaluate((element) => getComputedStyle(element).borderTopWidth),
  };
}

for (const skin of ["refined", "linear", "windows-98"]) {
  test.describe(skin, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        ({ skinKey, themeKey, skinId }) => {
          localStorage.setItem(skinKey, JSON.stringify({ skin: skinId, reduceMotion: true }));
          localStorage.setItem(themeKey, "light");
        },
        { skinKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY, skinId: skin },
      );
    });

    test("the run waits on its approval, then finishes or cancels", async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto("/templates/agent-run");
      const preview = page.locator("#preview");
      const header = preview.locator("header").filter({ hasText: "Weekly churn report" });
      const postStep = preview
        .locator('[data-control-family="timeline"][data-slot="item"]')
        .filter({ hasText: "Post the summary to #revenue" });

      await expect(header.getByText("Needs approval", { exact: true })).toBeVisible();
      await expect(postStep).toHaveAttribute("aria-current", "step");

      const look = await approvalLook(preview);
      if (skin === "refined") {
        expect(look.rootPadding).not.toBe("0px");
        expect(look.footerBorder).toBe("0px");
      }
      if (skin === "linear") {
        expect(look.rootPadding).toBe("0px");
        expect(look.footerBorder).not.toBe("0px");
      }

      await preview.getByRole("button", { name: "Approve", exact: true }).click();
      await expect(header.getByText("Done", { exact: true })).toBeVisible({ timeout: 5_000 });
      await expect(preview.getByText("Approved", { exact: true })).toBeVisible();
      await expect(preview.getByRole("button", { name: "Run again" })).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`agent-run-${skin}.png`) });

      await preview.getByRole("button", { name: "Run again" }).click();
      await preview.getByRole("button", { name: "Deny", exact: true }).click();
      await expect(header.getByText("Cancelled", { exact: true })).toBeVisible();
      await preview.getByRole("button", { name: /slack\.post/ }).click();
      await expect(preview.getByText("Denied by you", { exact: true })).toBeVisible();
    });
  });
}
