import { expect, type Locator, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

async function measureBlockGaps(container: Locator) {
  return container.evaluate((element) => {
    const bounds = Array.from(element.children, (child) => child.getBoundingClientRect());
    return bounds.slice(1).map((rect, index) => rect.top - bounds[index].bottom);
  });
}

async function measureHeadingGaps(flow: Locator) {
  return flow.evaluate((element) => {
    const heading = element.querySelector("h3");
    const previous = heading?.previousElementSibling;
    const following = heading?.nextElementSibling;
    if (!heading || !previous || !following) throw new Error("Markdown heading composition is missing");
    return {
      before: heading.getBoundingClientRect().top - previous.getBoundingClientRect().bottom,
      after: following.getBoundingClientRect().top - heading.getBoundingClientRect().bottom,
    };
  });
}

for (const width of [390, 1440]) {
  test(`${width}px: install guide separates adjacent examples and other section blocks`, async ({ page }, testInfo) => {
    await page.addInitScript(
      ({ editorStorageKey, modeStorageKey }) => {
        localStorage.setItem(editorStorageKey, JSON.stringify({ skin: "refined" }));
        localStorage.setItem(modeStorageKey, "light");
      },
      { editorStorageKey: THEME_EDITOR_STORAGE_KEY, modeStorageKey: THEME_STORAGE_KEY },
    );
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/get-started");
    await expect(page.locator("html")).toHaveAttribute("data-skin", "refined");
    const packageSection = page.locator("#package");
    await waitForReactHydration(packageSection);
    await expect(packageSection.locator('[data-control-family="code"][data-slot="root"]')).toHaveCount(2);
    await page.evaluate(() => document.fonts.ready);

    for (const sectionId of ["package", "install", "verify"]) {
      const body = page.locator(`#${sectionId} > div`);
      await body.scrollIntoViewIfNeeded();
      await expect(body).toBeVisible();
      const gaps = await measureBlockGaps(body);
      expect(gaps.length).toBeGreaterThan(0);
      for (const gap of gaps) expect(gap, sectionId).toBeCloseTo(16, 0);
    }

    await packageSection.screenshot({ path: testInfo.outputPath("package-block-spacing.png") });

    const packageBody = packageSection.locator('[data-control-family="markdown"][data-slot="flow"]');
    const markdownRoot = page.locator('main [data-control-family="markdown"][data-slot="root"]').first();
    await markdownRoot.evaluate((element) => element.style.setProperty("--spacing", "6px"));
    const resizedGaps = await measureBlockGaps(packageBody);
    for (const gap of resizedGaps) expect(gap).toBeCloseTo(24, 0);

    await markdownRoot.evaluate((element) => element.style.setProperty("--cui-markdown-flow-gap", "32px"));
    const customizedGaps = await measureBlockGaps(packageBody);
    for (const gap of customizedGaps) expect(gap).toBeCloseTo(32, 0);

    await packageBody.evaluate((element) => {
      const customBlock = document.createElement("div");
      customBlock.textContent = "A custom block with its own margin";
      customBlock.style.marginTop = "20px";
      element.append(customBlock);
    });
    expect((await measureBlockGaps(packageBody)).at(-1)).toBeCloseTo(52, 0);
  });
}

test("rendered Markdown uses the shared flow and preserves heading hierarchy", async ({ page }) => {
  await page.goto("/primitives/markdown");
  const markdownRoot = page.locator('main [data-control-family="markdown"][data-slot="root"]').first();
  await waitForReactHydration(markdownRoot);
  const heading = markdownRoot.getByRole("heading", { name: "Before you ship" });
  await heading.scrollIntoViewIfNeeded();
  const flow = markdownRoot.locator('[data-control-family="markdown"][data-slot="flow"]');
  await expect(flow).toHaveCount(1);
  const headingGaps = await measureHeadingGaps(flow);
  expect(headingGaps.before).toBeCloseTo(24, 0);
  expect(headingGaps.after).toBeCloseTo(16, 0);

  await markdownRoot.evaluate((element) => {
    element.style.setProperty("--cui-markdown-flow-gap", "32px");
    element.style.setProperty("--cui-markdown-heading-gap", "48px");
  });
  const resizedHeadingGaps = await measureHeadingGaps(flow);
  expect(resizedHeadingGaps.before).toBeCloseTo(48, 0);
  expect(resizedHeadingGaps.after).toBeCloseTo(32, 0);
});
