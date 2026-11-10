import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DynamicNotification,
  DynamicNotificationClose,
  DynamicNotificationContent,
  DynamicNotificationIsland,
  DynamicNotificationPill,
} from "./dynamic-notification";

function renderCloseButton(disabled: boolean) {
  const html = renderToStaticMarkup(
    <DynamicNotification defaultOpen disabled={disabled}>
      <DynamicNotificationIsland>
        <DynamicNotificationPill>Assistant</DynamicNotificationPill>
        <DynamicNotificationContent>
          <DynamicNotificationClose />
        </DynamicNotificationContent>
      </DynamicNotificationIsland>
    </DynamicNotification>,
  );
  return html.match(/<button[^>]*data-slot="close"[^>]*>/)?.[0] ?? "";
}

describe("DynamicNotification disabled", () => {
  test("disables the close button instead of leaving a press that does nothing", () => {
    expect(renderCloseButton(true)).toContain(' disabled=""');
  });

  test("leaves the close button enabled otherwise", () => {
    const close = renderCloseButton(false);

    expect(close).toContain('aria-label="Collapse notification"');
    expect(close).not.toContain(' disabled=""');
  });
});
