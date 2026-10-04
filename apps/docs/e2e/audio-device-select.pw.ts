import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("keeps a disconnected selection, restores it on reconnect, and supports no input", async ({ page }) => {
  await page.goto("/components/audio-device-select");
  const trigger = page.getByRole("combobox", { name: "Microphone", exact: true });
  await waitForReactHydration(trigger);
  await expect(trigger).toContainText("Shure MV7+");
  await page.getByRole("button", { name: "Disconnect microphone", exact: true }).click();
  await expect(trigger).toContainText("Shure MV7+ (disconnected)");
  await expect(trigger).toHaveAttribute("data-missing", "true");
  await page.getByRole("button", { name: "Reconnect microphone", exact: true }).click();
  await expect(trigger).toContainText("Shure MV7+");
  await expect(trigger).not.toHaveAttribute("data-missing");

  await trigger.click();
  await expect(page.getByRole("option", { name: "Camera microphone", exact: true })).toBeDisabled();
  await expect(page.getByRole("option", { name: "System microphone Default", exact: true })).toBeVisible();
  await page.getByRole("option", { name: "No microphone", exact: true }).click();
  await expect(trigger).toContainText("No microphone");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("img", { name: "Microphone preview" })).not.toHaveAttribute("data-active");
});

test("shows loading and blocked permission states", async ({ page }) => {
  await page.goto("/components/audio-device-select");
  const loading = page.getByRole("combobox", { name: "Loading input", exact: true });
  await expect(loading).toBeDisabled();
  await expect(loading).toContainText("Finding devices…");
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("combobox", { name: "Blocked input", exact: true })).toHaveAttribute("data-permission", "denied");
  await expect(page.getByText("Microphone access is blocked. Allow it in your browser’s site settings.", { exact: true })).toBeVisible();
});

test("requests recorder microphone permission and reports denial", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        enumerateDevices: async () => [],
        getUserMedia: async () => {
          throw new DOMException("Permission denied", "NotAllowedError");
        },
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
  await page.goto("/components/audio-recorder");
  const permission = page.getByRole("button", { name: "Allow microphone access", exact: true });
  await waitForReactHydration(permission);
  await permission.click();
  await expect(page.getByRole("combobox", { name: "Microphone", exact: true })).toHaveAttribute("data-permission", "denied");
  await expect(
    page.getByText("Microphone access is blocked. Allow it in your browser's site settings, then try again.", { exact: true }),
  ).toBeVisible();
  await expect(permission).toHaveCount(0);
});

test("refreshes microphone names after permission and releases the permission stream", async ({ page }) => {
  await page.addInitScript(() => {
    let granted = false;
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        enumerateDevices: async () => [{ deviceId: "usb", kind: "audioinput", label: granted ? "USB microphone" : "", groupId: "usb" }],
        getUserMedia: async () => {
          granted = true;
          return { getTracks: () => [{ stop: () => document.documentElement.setAttribute("data-permission-stream-stopped", "true") }] };
        },
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
  await page.goto("/components/audio-recorder");
  const permission = page.getByRole("button", { name: "Allow microphone access", exact: true });
  await waitForReactHydration(permission);
  await permission.click();
  const trigger = page.getByRole("combobox", { name: "Microphone", exact: true });
  await expect(trigger).toHaveAttribute("data-permission", "granted");
  await expect(page.locator("html")).toHaveAttribute("data-permission-stream-stopped", "true");
  await trigger.click();
  await page.getByRole("option", { name: "USB microphone", exact: true }).click();
  await expect(trigger).toContainText("USB microphone");
  await expect(permission).toHaveCount(0);
});
