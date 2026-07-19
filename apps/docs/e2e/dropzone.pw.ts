import { expect, type Locator, test } from "@playwright/test";

type BrowserFile = {
  name: string;
  type: string;
  content: string;
  lastModified: number;
};

const imagePng: BrowserFile = {
  name: "image.png",
  type: "image/png",
  content: "png",
  lastModified: 1,
};

const inputExecutable: BrowserFile = {
  name: "malware.exe",
  type: "application/x-msdownload",
  content: "executable",
  lastModified: 2,
};

async function chooseBrowserFiles(input: Locator, files: readonly BrowserFile[]) {
  await input.evaluate((element, selectedFiles) => {
    if (!(element instanceof HTMLInputElement)) throw new Error("Expected a file input.");
    const dataTransfer = new DataTransfer();
    for (const file of selectedFiles) {
      dataTransfer.items.add(
        new File([file.content], file.name, {
          type: file.type,
          lastModified: file.lastModified,
        }),
      );
    }
    element.files = dataTransfer.files;
    element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }, files);
}

async function waitForReactHydration(locator: Locator) {
  await expect.poll(() => locator.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
}

async function dispatchFileEvent(locator: Locator, eventType: string, files: readonly BrowserFile[]) {
  return locator.evaluate(
    (element, details) => {
      const dataTransfer = new DataTransfer();
      for (const file of details.files) {
        dataTransfer.items.add(
          new File([file.content], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          }),
        );
      }
      const event = new DragEvent(details.eventType, {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });
      const dispatched = element.dispatchEvent(event);
      return { defaultPrevented: !dispatched, dropEffect: dataTransfer.dropEffect };
    },
    { eventType, files },
  );
}

async function dispatchUnknownFileEnter(locator: Locator) {
  await locator.evaluate((element) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File(["unknown"], "unknown.bin", {
        type: "application/octet-stream",
        lastModified: 1,
      }),
    );
    Object.defineProperty(dataTransfer, "files", { value: [] });
    Object.defineProperty(dataTransfer, "items", { value: [] });
    element.dispatchEvent(
      new DragEvent("dragenter", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
  });
}

async function crossNestedChildWithoutLeavingArea(child: Locator, file: BrowserFile) {
  await child.evaluate((element, nestedFile) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File([nestedFile.content], nestedFile.name, {
        type: nestedFile.type,
        lastModified: nestedFile.lastModified,
      }),
    );
    element.dispatchEvent(
      new DragEvent("dragenter", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    element.dispatchEvent(
      new DragEvent("dragleave", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
        relatedTarget: element.parentElement,
      }),
    );
  }, file);
}

async function dispatchTextDrop(locator: Locator) {
  return locator.evaluate((element) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", "plain text");
    const enter = new DragEvent("dragenter", {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    });
    const over = new DragEvent("dragover", {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    });
    const drop = new DragEvent("drop", {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    });
    element.dispatchEvent(enter);
    const overDispatched = element.dispatchEvent(over);
    const dropDispatched = element.dispatchEvent(drop);
    return {
      overDefaultPrevented: !overDispatched,
      dropDefaultPrevented: !dropDispatched,
    };
  });
}

const acceptedPng: BrowserFile = {
  name: "next.png",
  type: "image/png",
  content: "png",
  lastModified: 10,
};

const rejectedExecutable: BrowserFile = {
  name: "dragged.exe",
  type: "application/x-msdownload",
  content: "exe",
  lastModified: 11,
};

test("visible dropzone validates chooser and drag intake", async ({ page }) => {
  await page.goto("/primitives/dropzone");

  const roots = page.locator('[data-control-ui="dropzone"][data-slot="root"]');
  const main = roots.filter({ has: page.locator('input[type="file"][accept*=".png"]') }).first();
  const input = main.locator('input[type="file"]');
  const selectedFiles = main.getByRole("list", { name: "Selected files" });
  const rejectedFiles = main.getByRole("list", { name: "Rejected files" });
  const status = main.getByRole("status");
  const trigger = main.locator('[data-control-ui="dropzone"][data-slot="trigger"]');
  const area = main.locator('[data-control-ui="dropzone"][data-slot="area"]');

  await waitForReactHydration(trigger);

  await chooseBrowserFiles(input, [imagePng, inputExecutable]);
  await expect(selectedFiles.locator("li")).toHaveCount(1);
  await expect(selectedFiles).toContainText("image.png");
  await expect(rejectedFiles).toContainText("Choose a PNG, JPEG, WebP, or PDF file.");

  const chooserPromise = page.waitForEvent("filechooser");
  await trigger.focus();
  await trigger.press("Enter");
  const chooser = await chooserPromise;
  await chooser.setFiles([]);
  await chooseBrowserFiles(input, [imagePng]);
  await expect(selectedFiles.locator("li")).toHaveCount(1);
  await expect(rejectedFiles).toContainText("This file is already selected.");

  await main.getByRole("button", { name: "Remove image.png" }).click();
  await expect(selectedFiles.locator("li")).toHaveCount(0);
  await main.getByRole("button", { name: "Clear all" }).click();
  await expect(rejectedFiles.locator("li")).toHaveCount(0);

  await chooseBrowserFiles(input, [imagePng]);
  await expect(selectedFiles).toContainText("image.png");
  await expect(status).toHaveText("1 file selected.");

  await dispatchFileEvent(area, "dragenter", [acceptedPng]);
  await expect(status).toHaveText("Release to add files.");
  const dragOver = await dispatchFileEvent(area, "dragover", [acceptedPng]);
  expect(dragOver.defaultPrevented).toBe(true);
  await crossNestedChildWithoutLeavingArea(trigger, acceptedPng);
  await expect(status).toHaveText("Release to add files.");
  await dispatchFileEvent(area, "dragleave", [acceptedPng]);
  await expect(status).toHaveText("1 file selected.");

  await dispatchFileEvent(area, "dragenter", [rejectedExecutable]);
  await expect(status).toHaveText("Some files are not accepted.");
  await dispatchFileEvent(area, "dragleave", [rejectedExecutable]);

  await dispatchUnknownFileEnter(area);
  await expect(status).toHaveText("Release to check files.");
  await dispatchFileEvent(area, "dragleave", [acceptedPng]);

  const aggregateFiles = [
    { ...acceptedPng, name: "two.png", lastModified: 12 },
    { ...acceptedPng, name: "three.png", lastModified: 13 },
    { ...acceptedPng, name: "four.png", lastModified: 14 },
    { ...acceptedPng, name: "five.png", lastModified: 15 },
  ];
  await dispatchFileEvent(area, "dragenter", aggregateFiles);
  await expect(status).toHaveText("Some files are not accepted.");
  await dispatchFileEvent(area, "drop", aggregateFiles);
  await expect(selectedFiles.locator("li")).toHaveCount(4);
  await expect(rejectedFiles).toContainText("You can select up to 4 files.");
  await expect(selectedFiles).toContainText("four.png");
});

test("global overlay ignores drags owned by another dropzone", async ({ page }) => {
  await page.goto("/primitives/dropzone");

  const roots = page.locator('[data-control-ui="dropzone"][data-slot="root"]');
  const visible = roots.filter({ has: page.locator('input[type="file"][accept*=".png"]') }).first();
  const visibleArea = visible.locator('[data-control-ui="dropzone"][data-slot="area"]');
  const visibleSelectedFiles = visible.getByRole("list", { name: "Selected files" });
  const invisible = roots.filter({ hasText: "Configuration workspace" }).first();
  const area = invisible.locator('[data-control-ui="dropzone"][data-slot="area"]');
  const overlay = invisible.locator('[data-control-ui="dropzone"][data-slot="overlay"]');
  const selectedFiles = invisible.getByRole("list", { name: "Selected files" });
  const rejectedFiles = invisible.getByRole("list", { name: "Rejected files" });
  const body = page.locator("body");
  const validJson: BrowserFile = {
    name: "config.json",
    type: "application/json",
    content: '{"enabled":true}',
    lastModified: 20,
  };

  await waitForReactHydration(overlay);
  await expect(async () => {
    await dispatchFileEvent(body, "dragenter", [validJson]);
    await expect(overlay).toHaveAttribute("data-active", "true");
  }).toPass();
  await expect(overlay).toContainText("Release to check files.");

  await dispatchFileEvent(visibleArea, "dragenter", [acceptedPng]);
  await expect(overlay).not.toHaveAttribute("data-active", "true");
  await dispatchFileEvent(visibleArea, "drop", [acceptedPng]);
  await expect(visibleSelectedFiles).toContainText("next.png");
  await expect(selectedFiles.locator("li")).toHaveCount(0);

  await dispatchFileEvent(body, "dragenter", [validJson]);
  await expect(overlay).toHaveAttribute("data-active", "true");

  await dispatchFileEvent(area, "dragenter", [rejectedExecutable]);
  await expect(overlay).toContainText("Some files are not accepted.");
  await dispatchFileEvent(area, "dragleave", [rejectedExecutable]);

  await dispatchFileEvent(area, "dragenter", [validJson]);
  await expect(overlay).toContainText("Release to check files.");
  await dispatchFileEvent(area, "drop", [validJson]);
  await expect(overlay).not.toHaveAttribute("data-active", "true");
  await expect(selectedFiles).toContainText("config.json");

  const invalidJson: BrowserFile = {
    name: "invalid.json",
    type: "application/json",
    content: "{not-json}",
    lastModified: 21,
  };
  await dispatchFileEvent(area, "dragenter", [invalidJson]);
  await dispatchFileEvent(area, "drop", [invalidJson]);
  await expect(rejectedFiles).toContainText("Choose valid JSON.");

  const outsideDrop = await dispatchFileEvent(body, "drop", [{ ...validJson, name: "outside.json", lastModified: 22 }]);
  expect(outsideDrop.defaultPrevented).toBe(true);
  await expect(selectedFiles).not.toContainText("outside.json");

  const textDrop = await dispatchTextDrop(body);
  expect(textDrop).toEqual({ overDefaultPrevented: false, dropDefaultPrevented: false });
  await expect(overlay).not.toHaveAttribute("data-active", "true");
});
