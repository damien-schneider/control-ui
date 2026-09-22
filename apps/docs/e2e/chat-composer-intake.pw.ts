import { expect, type Locator, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

type ClipboardPayload = "file" | "text" | "file-with-text";

const pastedImage = { name: "pasted-screenshot.png", type: "image/png" };
const droppedNote = { name: "dropped-note.txt", type: "text/plain" };

/** Returns whether the composer claimed the paste, which is what stops the caret from receiving it. */
function pasteInto(target: Locator, payload: ClipboardPayload) {
  return target.evaluate(
    (element, { kind, image }) => {
      const data = new DataTransfer();
      if (kind !== "text") data.items.add(new File([new Uint8Array([137, 80, 78, 71])], image.name, { type: image.type }));
      if (kind !== "file") data.setData("text/plain", "pasted words");
      return !element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    },
    { kind: payload, image: pastedImage },
  );
}

function dragFileOver(target: Locator, type: "dragenter" | "dragover" | "drop") {
  return target.evaluate(
    (element, { eventType, note }) => {
      const data = new DataTransfer();
      data.items.add(new File(["a short note"], note.name, { type: note.type }));
      return !element.dispatchEvent(new DragEvent(eventType, { dataTransfer: data, bubbles: true, cancelable: true }));
    },
    { eventType: type, note: droppedNote },
  );
}

test("the composer takes attachments from paste and drop, not only the file button", async ({ page }) => {
  await page.goto("/components/chat-composer-attachment");
  const preview = page.locator("#preview");
  const shell = preview.locator('[data-control-family="chat-composer"][data-slot="shell"]');
  const textarea = shell.locator("textarea");
  await waitForReactHydration(textarea);

  await expect(preview.getByRole("button", { name: "Add files" })).toBeEnabled();

  expect(await pasteInto(textarea, "file")).toBe(true);
  await expect(shell.getByRole("listitem", { name: pastedImage.name })).toBeVisible();

  const attachmentCount = await shell.getByRole("listitem").count();
  expect(await pasteInto(textarea, "text")).toBe(false);
  expect(await pasteInto(textarea, "file-with-text")).toBe(false);
  await expect(shell.getByRole("listitem")).toHaveCount(attachmentCount);

  const overlay = preview.locator('[data-control-family="dropzone"][data-slot="overlay"]');
  await dragFileOver(textarea, "dragenter");
  await dragFileOver(textarea, "dragover");
  await expect(overlay).toHaveAttribute("data-active", "true");
  await expect(overlay).toHaveAttribute("data-state", "accept");

  expect(await dragFileOver(textarea, "drop")).toBe(true);
  await expect(shell.getByRole("listitem", { name: droppedNote.name })).toBeVisible();
  await expect(overlay).not.toHaveAttribute("data-active", "true");

  const removed = shell.getByRole("listitem", { name: droppedNote.name });
  await removed.getByRole("button", { name: `Remove ${droppedNote.name}` }).click();
  await expect(removed).toHaveCount(0);
});

test("the rich editor releases file transfers instead of swallowing them", async ({ page }) => {
  await page.goto("/use-cases/chat");
  const editor = page.locator(".ProseMirror").first();
  await expect(editor).toHaveAttribute("contenteditable", "true");

  expect(await dragFileOver(editor, "dragover")).toBe(false);
  expect(await dragFileOver(editor, "drop")).toBe(false);
  expect(await pasteInto(editor, "file")).toBe(false);

  expect(await pasteInto(editor, "text")).toBe(true);
});

test("a pasted image preview shows the whole image inside its tile", async ({ page }) => {
  await page.goto("/components/chat-composer-attachment");
  const shell = page.locator("#preview").locator('[data-control-family="chat-composer"][data-slot="shell"]');
  const textarea = shell.locator("textarea");
  await waitForReactHydration(textarea);

  await textarea.evaluate(async (element) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Canvas could not encode a PNG.");
    const data = new DataTransfer();
    data.items.add(new File([blob], "square-screenshot.png", { type: "image/png" }));
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  });

  const tile = shell.getByRole("listitem", { name: "square-screenshot.png" });
  const image = tile.locator("img");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveJSProperty("complete", true);
  const [tileBox, imageBox] = await Promise.all([tile.boundingBox(), image.boundingBox()]);
  expect(imageBox?.height).toBeLessThanOrEqual(tileBox?.height ?? 0);
  expect(imageBox?.width).toBeLessThanOrEqual(tileBox?.width ?? 0);
});
