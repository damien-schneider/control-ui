import { expect, type Route, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { emailPreviewRequest, emailPreviewResult } from "@/src/registry/examples/control-ui/email/options";
import { waitForReactHydration } from "./browser-test-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ skin: "refined", overrides: {}, light: {}, dark: {}, reduceMotion: true }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/ai/email");
  await waitForReactHydration(page.getByRole("button", { name: "Invitation", exact: true }));
});

for (const mode of ["Light", "Dark"] as const) {
  test(`renders and exports a newsletter without a skin in ${mode.toLowerCase()} mode`, async ({ page }) => {
    await page.getByRole("radio", { name: mode, exact: true }).focus();
    await page.keyboard.press("Space");
    await page.getByRole("combobox", { name: "Skin", exact: true }).click();
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/email-preview") && emailPreviewRequest.parse(response.request().postDataJSON()).skin === "none",
    );
    await page.getByRole("option", { name: "No skin", exact: true }).click();
    expect((await responsePromise).status()).toBe(200);
    const newsletterResponse = page.waitForResponse("**/api/email-preview");
    await page.getByRole("button", { name: "Newsletter", exact: true }).click();
    const { html, text } = emailPreviewResult.parse(await (await newsletterResponse).json());
    expect(html).not.toMatch(/var\(|oklch\(|\drem\b/);
    expect(text).toContain("A LITTLE ROOM FOR INSPIRATION.");
    const frame = page.frameLocator('iframe[title$="email preview"]');
    await expect(frame.getByRole("heading", { level: 1 })).toHaveText("A little room for inspiration.");
    await expect(frame.locator('table[style*="max-width"]')).toHaveCSS("border-radius", "0px");
    await expect(page.getByRole("button", { name: "Download HTML", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Plain text", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Mobile", exact: true }).click();
    await expect.poll(() => frame.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/control-ui-email-no-skin-${mode.toLowerCase()}.png`, fullPage: true });
  });
}

test("composes five layouts, loads images, and exports the rendered email", async ({ page }) => {
  const frame = page.frameLocator('iframe[title$="email preview"]');
  await expect(frame.getByRole("heading", { level: 1 })).toHaveText("A place for your next idea.");
  for (const [layout, heading] of [
    ["Announcement", "Make room for what’s next."],
    ["Image + text", "Fresh perspectives."],
    ["Newsletter", "A little room for inspiration."],
    ["Summary", "Good work adds up."],
  ]) {
    await page.getByRole("button", { name: layout, exact: true }).click();
    await expect(frame.getByRole("heading", { level: 1 })).toHaveText(heading);
    for (const image of await frame.getByRole("img").all()) {
      await expect
        .poll(() => image.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0))
        .toBe(true);
    }
    if (layout === "Announcement" || layout === "Image + text")
      await page
        .locator('iframe[title$="email preview"]')
        .screenshot({ path: `/tmp/control-ui-email-${layout === "Announcement" ? "product" : "editorial"}.png` });
  }
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download HTML", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("summary.html");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  const html = Buffer.concat(chunks).toString();
  expect(html).toContain("Good work adds up.");
  expect(html).not.toMatch(/var\(|oklch\(/);
  await page.getByRole("button", { name: "Mobile", exact: true }).click();
  await expect.poll(() => frame.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: "/tmp/control-ui-email-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const layout of ["Invitation", "Announcement", "Image + text", "Newsletter", "Summary"]) {
    await page.getByRole("button", { name: layout, exact: true }).click();
    await expect(page.getByRole("button", { name: "Download HTML", exact: true })).toBeEnabled();
    await expect.poll(() => frame.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await page.screenshot({ path: "/tmp/control-ui-email-mobile.png", fullPage: true });
});

test("shows a rendering error, disables exports, and retries from the keyboard", async ({ page }) => {
  await page.route("**/api/email-preview", (route) =>
    route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: "Email theme: unsupported --primary." }) }),
  );
  await page.getByRole("button", { name: "Announcement", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "unsupported --primary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download HTML", exact: true })).toBeDisabled();
  await page.unroute("**/api/email-preview");
  await page.getByRole("button", { name: "Retry preview", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.frameLocator('iframe[title$="email preview"]').getByRole("heading", { level: 1 })).toHaveText(
    "Make room for what’s next.",
  );
});

test("re-renders the email when the active skin and color mode change", async ({ page }) => {
  const frame = page.frameLocator('iframe[title$="email preview"]');
  await expect(frame.getByRole("heading", { level: 1 })).toHaveText("A place for your next idea.");
  const refinedHeadingSize = await frame.getByRole("heading", { level: 1 }).evaluate((element) => getComputedStyle(element).fontSize);
  await page.getByRole("combobox", { name: "Skin", exact: true }).click();
  await page.getByRole("option", { name: "Linear", exact: true }).click();
  await expect
    .poll(() => frame.getByRole("heading", { level: 1 }).evaluate((element) => getComputedStyle(element).fontSize))
    .not.toBe(refinedHeadingSize);
  const lightBackground = await frame.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  const lightBorder = await frame.locator("hr").evaluate((element) => getComputedStyle(element).borderTopColor);
  await page.getByRole("radio", { name: "Dark", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect.poll(() => frame.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(lightBackground);
  await expect.poll(() => frame.locator("hr").evaluate((element) => getComputedStyle(element).borderTopColor)).not.toBe(lightBorder);
  await expect(page.getByRole("button", { name: "Download HTML", exact: true })).toBeEnabled();
});

test("a delayed preview cannot replace a newly selected layout", async ({ page }) => {
  const frame = page.frameLocator('iframe[title$="email preview"]');
  await expect(frame.getByRole("heading", { level: 1 })).toHaveText("A place for your next idea.");
  const delayedPreview = Promise.withResolvers<Route>();
  await page.route("**/api/email-preview", (route) => {
    const request = emailPreviewRequest.parse(route.request().postDataJSON());
    if (request.layout === "product") delayedPreview.resolve(route);
    else return route.continue();
  });
  await page.getByRole("button", { name: "Announcement", exact: true }).click();
  const pendingRoute = await delayedPreview.promise;
  await expect(page.getByRole("status").filter({ hasText: "Rendering email" })).toBeVisible();
  await page.getByRole("button", { name: "Summary", exact: true }).click();
  await expect(frame.getByRole("heading", { level: 1 })).toHaveText("Good work adds up.");
  await pendingRoute.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ html: "<h1>Stale announcement</h1>", text: "Stale announcement" }),
  });
  await expect(frame.getByRole("heading", { level: 1 })).toHaveText("Good work adds up.");
});

test("email buttons, panels, and images follow the shared sizing tokens", async ({ page }) => {
  const frame = page.frameLocator('iframe[title$="email preview"]');
  const button = frame.getByRole("link", { name: "Explore what’s new", exact: true });
  for (const theme of [
    { skin: "Refined", height: "36px", radius: "8px", padding: "16px", fontSize: "14px", panel: "8px", image: "16px" },
    { skin: "Linear", height: "32px", radius: "8px", padding: "12px", fontSize: "13px", panel: "12px", image: "14px" },
    { skin: "Rig", height: "40px", radius: "0px", padding: "18px", fontSize: "14px", panel: "0px", image: "0px" },
  ]) {
    await page.getByRole("combobox", { name: "Skin", exact: true }).click();
    await page.getByRole("option", { name: theme.skin, exact: true }).click();
    await page.getByRole("button", { name: "Announcement", exact: true }).click();
    await expect(button).toHaveCSS("height", theme.height);
    await expect(button).toHaveCSS("border-radius", theme.radius);
    await expect(button).toHaveCSS("padding-left", theme.padding);
    await expect(button).toHaveCSS("font-size", theme.fontSize);
    await expect(frame.locator('table[style*="max-width"]')).toHaveCSS("border-radius", theme.panel);
    await expect(frame.getByRole("img")).toHaveCSS("border-radius", theme.image);
  }
});
