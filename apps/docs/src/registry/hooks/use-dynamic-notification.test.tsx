import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import type { DynamicNotificationController, DynamicNotificationProps } from "./use-dynamic-notification";
import { useDynamicNotification } from "./use-dynamic-notification";

function renderNotification(onReply: DynamicNotificationProps["onReply"]) {
  let notification: DynamicNotificationController | undefined;
  function Probe() {
    notification = useDynamicNotification({ defaultReplyValue: "On my way", onReply });
    return null;
  }
  renderToStaticMarkup(<Probe />);
  if (!notification) throw new Error("useDynamicNotification did not run");
  return notification;
}

describe("useDynamicNotification reply", () => {
  test("ignores a second submit while the first reply is still pending", async () => {
    let calls = 0;
    let settle = () => {};
    const { submitReply } = renderNotification(() => {
      calls += 1;
      return new Promise<void>((resolve) => {
        settle = resolve;
      });
    });

    const first = submitReply();
    await submitReply();
    expect(calls).toBe(1);

    settle();
    await first;
    void submitReply();
    expect(calls).toBe(2);
  });

  test("a rejected reply settles instead of escaping as an unhandled rejection, and frees the next submit", async () => {
    let calls = 0;
    const { submitReply } = renderNotification(() => {
      calls += 1;
      return Promise.reject(new Error("offline"));
    });

    await expect(submitReply()).resolves.toBeUndefined();
    await submitReply();
    expect(calls).toBe(2);
  });
});
