import { expect, type FrameLocator, type Page, type Route, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { emailPreviewRequest, emailPreviewResult } from "@/src/registry/examples/control-ui/email/options";
import { waitForReactHydration } from "./browser-test-helpers";

const examples = [
  { anchor: "#preview", layout: "invitation", heading: "A place for your next idea.", mailing: "transactional" },
  { anchor: "#example-announcement", layout: "product", heading: "Make room for what’s next.", mailing: "marketing" },
  { anchor: "#example-release-notes", layout: "release", heading: "What shipped this month.", mailing: "marketing" },
  { anchor: "#example-editorial", layout: "editorial", heading: "Fresh perspectives.", mailing: "marketing" },
  { anchor: "#example-newsletter", layout: "newsletter", heading: "A little room for inspiration.", mailing: "marketing" },
  { anchor: "#example-summary", layout: "summary", heading: "Good work adds up.", mailing: "marketing" },
  { anchor: "#example-verification", layout: "verification", heading: "Confirm your email address", mailing: "transactional" },
  { anchor: "#example-receipt", layout: "receipt", heading: "Thanks for your order.", mailing: "transactional" },
] as const;

const emailFrame = (page: Page, layout: string) => page.frameLocator(`iframe[title="${layout} email preview"]`);
const renderedHeading = (page: Page, layout: string) => emailFrame(page, layout).getByRole("heading", { level: 1 });
const noOverflow = (frame: FrameLocator) => frame.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth);

async function expectImagesLoaded(frame: FrameLocator) {
  for (const image of await frame.getByRole("img").all()) {
    await expect
      .poll(() => image.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0))
      .toBe(true);
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ skin: "refined", overrides: {}, light: {}, dark: {}, reduceMotion: true }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/components/email");
  await waitForReactHydration(page.locator("#preview").getByRole("button", { name: "Desktop", exact: true }));
});

test("renders every template with its images and the footer its mailing type requires", async ({ page }) => {
  for (const { anchor, layout, heading, mailing } of examples) {
    const frame = emailFrame(page, layout);
    await expect(renderedHeading(page, layout)).toHaveText(heading);
    await expectImagesLoaded(frame);
    const unsubscribe = frame.getByRole("link", { name: "Unsubscribe", exact: true });
    if (mailing === "marketing") await expect(unsubscribe).toBeVisible();
    else await expect(unsubscribe).toHaveCount(0);
    await expect(frame.getByRole("img", { name: "LinkedIn" })).toBeVisible();
    await expect(frame.getByText("Fieldwork, Inc.").first()).toBeVisible();
    await expect(page.locator(anchor).getByRole("button", { name: "Download HTML", exact: true })).toBeEnabled();
  }
  await page.screenshot({ path: "/tmp/control-ui-email-desktop.png", fullPage: true });
});

test("switches a preview between the contained card and the plain page surface", async ({ page }) => {
  const section = page.locator("#example-verification");
  const frame = emailFrame(page, "verification");
  const container = frame.locator('table[style*="max-width"]').first();
  await expect(renderedHeading(page, "verification")).toHaveText("Confirm your email address");
  const bodyBackground = () => frame.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(container).not.toHaveCSS("border-radius", "0px");
  await expect(container).not.toHaveCSS("background-color", await bodyBackground());
  await section.getByRole("button", { name: "Plain", exact: true }).click();
  await expect(renderedHeading(page, "verification")).toHaveText("Confirm your email address");
  await expect(container).toHaveCSS("border-radius", "0px");
  await expect(container).toHaveCSS("background-color", await bodyBackground());
});

test("narrows a single preview to a mobile width without clipping its content", async ({ page }) => {
  const section = page.locator("#example-newsletter");
  await expect(renderedHeading(page, "newsletter")).toHaveText("A little room for inspiration.");
  await section.getByRole("button", { name: "Mobile", exact: true }).click();
  await expect.poll(() => noOverflow(emailFrame(page, "newsletter"))).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const { layout } of examples) await expect.poll(() => noOverflow(emailFrame(page, layout))).toBe(true);
  await page.screenshot({ path: "/tmp/control-ui-email-mobile.png", fullPage: true });
});

for (const mode of ["Light", "Dark"] as const) {
  test(`renders and exports without a skin in ${mode.toLowerCase()} mode`, async ({ page }) => {
    await page.getByRole("radio", { name: mode, exact: true }).focus();
    await page.keyboard.press("Space");
    await page.getByRole("combobox", { name: "Skin", exact: true }).click();
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/email-preview") &&
        emailPreviewRequest.parse(response.request().postDataJSON()).skin === "none" &&
        emailPreviewRequest.parse(response.request().postDataJSON()).layout === "newsletter",
    );
    await page.getByRole("option", { name: "No skin", exact: true }).click();
    const { html, text } = emailPreviewResult.parse(await (await responsePromise).json());
    expect(html).not.toMatch(/var\(|oklch\(|\drem\b/);
    expect(html).toContain(`<meta name="color-scheme" content="${mode.toLowerCase()}"`);
    expect(text).toContain("A LITTLE ROOM FOR INSPIRATION.");
    expect(text).toContain("Unsubscribe");
    const frame = emailFrame(page, "newsletter");
    await expect(frame.getByRole("heading", { level: 1 })).toHaveText("A little room for inspiration.");
    await expect(frame.locator('table[style*="max-width"]').first()).toHaveCSS("border-radius", "0px");
    await page.screenshot({ path: `/tmp/control-ui-email-no-skin-${mode.toLowerCase()}.png`, fullPage: true });
  });
}

test("downloads the rendered HTML and plain text of one example", async ({ page }) => {
  const section = page.locator("#example-receipt");
  await expect(renderedHeading(page, "receipt")).toHaveText("Thanks for your order.");
  const downloadPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Download HTML", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("receipt.html");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  const html = Buffer.concat(chunks).toString();
  expect(html).toContain("Thanks for your order.");
  expect(html).not.toMatch(/var\(|oklch\(/);
  const textDownloadPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Plain text", exact: true }).click();
  expect((await textDownloadPromise).suggestedFilename()).toBe("receipt.txt");
});

test("shows a rendering error, disables exports, and retries from the keyboard", async ({ page }) => {
  const section = page.locator("#example-release-notes");
  await page.route("**/api/email-preview", (route) => {
    if (emailPreviewRequest.parse(route.request().postDataJSON()).layout !== "release") return route.continue();
    return route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({ error: "Email theme: unsupported --primary." }),
    });
  });
  await page.reload();
  await expect(section.getByRole("alert").filter({ hasText: "unsupported --primary" })).toBeVisible();
  await expect(section.getByRole("button", { name: "Download HTML", exact: true })).toBeDisabled();
  await page.unroute("**/api/email-preview");
  await section.getByRole("button", { name: "Retry preview", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(renderedHeading(page, "release")).toHaveText("What shipped this month.");
});

test("re-renders every email when the active skin and color mode change", async ({ page }) => {
  const frame = emailFrame(page, "invitation");
  await expect(frame.getByRole("heading", { level: 1 })).toHaveText("A place for your next idea.");
  const refinedHeadingSize = await frame.getByRole("heading", { level: 1 }).evaluate((element) => getComputedStyle(element).fontSize);
  await page.getByRole("combobox", { name: "Skin", exact: true }).click();
  await page.getByRole("option", { name: "Linear", exact: true }).click();
  await expect
    .poll(() => frame.getByRole("heading", { level: 1 }).evaluate((element) => getComputedStyle(element).fontSize))
    .not.toBe(refinedHeadingSize);
  const lightBackground = await frame.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  const lightBorder = await frame
    .locator("hr")
    .first()
    .evaluate((element) => getComputedStyle(element).borderTopColor);
  await page.getByRole("radio", { name: "Dark", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect.poll(() => frame.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(lightBackground);
  await expect
    .poll(() =>
      frame
        .locator("hr")
        .first()
        .evaluate((element) => getComputedStyle(element).borderTopColor),
    )
    .not.toBe(lightBorder);
  await expect(page.locator("#preview").getByRole("button", { name: "Download HTML", exact: true })).toBeEnabled();
});

test("a delayed preview cannot replace the email rendered for the current theme", async ({ page }) => {
  const frame = emailFrame(page, "summary");
  await expect(frame.getByRole("heading", { level: 1 })).toHaveText("Good work adds up.");
  const delayedPreview = Promise.withResolvers<Route>();
  await page.route("**/api/email-preview", (route) => {
    const request = emailPreviewRequest.parse(route.request().postDataJSON());
    if (request.layout === "summary" && request.mode === "dark") delayedPreview.resolve(route);
    else return route.continue();
  });
  await page.getByRole("radio", { name: "Dark", exact: true }).focus();
  await page.keyboard.press("Space");
  const pendingRoute = await delayedPreview.promise;
  await expect(page.locator("#example-summary").getByRole("status").filter({ hasText: "Rendering email" })).toBeVisible();
  await page.getByRole("radio", { name: "Light", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(frame.getByRole("heading", { level: 1 })).toHaveText("Good work adds up.");
  await pendingRoute.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ html: "<h1>Stale summary</h1>", text: "Stale summary" }),
  });
  await expect(frame.getByRole("heading", { level: 1 })).toHaveText("Good work adds up.");
  await expect(frame.getByRole("heading", { level: 1, name: "Stale summary" })).toHaveCount(0);
});
