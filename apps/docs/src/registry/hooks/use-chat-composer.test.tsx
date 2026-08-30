import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import type { ChatComposerProps } from "./use-chat-composer";
import { useChatComposer } from "./use-chat-composer";

type ComposerOptions = Pick<ChatComposerProps, "value" | "defaultValue" | "onValueChange" | "onSubmit" | "state" | "density" | "disabled">;

function renderComposer(options: ComposerOptions) {
  let composer: ReturnType<typeof useChatComposer> | undefined;
  function Probe() {
    composer = useChatComposer(options);
    return null;
  }
  renderToStaticMarkup(<Probe />);
  if (!composer) throw new Error("useChatComposer did not run");
  return composer;
}

function renderComposerSubmit(options: ComposerOptions) {
  return renderComposer(options).submit;
}

function keyEvent(key: string, overrides: { shiftKey?: boolean; isComposing?: boolean } = {}) {
  let prevented = false;
  return {
    key,
    shiftKey: overrides.shiftKey ?? false,
    defaultPrevented: false,
    nativeEvent: { isComposing: overrides.isComposing ?? false },
    preventDefault: () => {
      prevented = true;
    },
    wasPrevented: () => prevented,
  };
}

describe("useChatComposer", () => {
  test("passes the trimmed value to onSubmit and blocks empty or submitting composers", () => {
    const submitted: string[] = [];
    const onSubmit = ({ value }: { value: string }) => {
      submitted.push(value);
    };

    renderComposerSubmit({ defaultValue: "  hello  ", onSubmit })();
    expect(submitted).toEqual(["hello"]);

    renderComposerSubmit({ defaultValue: "   ", onSubmit })();
    renderComposerSubmit({ defaultValue: "hi", state: "submitting", onSubmit })();
    expect(submitted).toEqual(["hello"]);
  });

  test("sends on Enter and leaves Shift+Enter, IME composition, and other keys to the textarea", () => {
    const submitted: string[] = [];
    const onSubmit = ({ value }: { value: string }) => {
      submitted.push(value);
    };
    const { handleKeyDown } = renderComposer({ defaultValue: "hello", onSubmit });

    const enter = keyEvent("Enter");
    handleKeyDown(enter);
    expect(submitted).toEqual(["hello"]);
    expect(enter.wasPrevented()).toBe(true);

    for (const event of [keyEvent("Enter", { shiftKey: true }), keyEvent("Enter", { isComposing: true }), keyEvent("a")]) {
      handleKeyDown(event);
      expect(event.wasPrevented()).toBe(false);
    }
    expect(submitted).toEqual(["hello"]);
  });

  test("routes a rejected async onSubmit to reportError instead of an unhandled rejection", async () => {
    const failure = new Error("send failed");
    const reported: unknown[] = [];
    const originalReportError = globalThis.reportError;
    globalThis.reportError = (error) => {
      reported.push(error);
    };

    try {
      const submit = renderComposerSubmit({
        defaultValue: "hello",
        onSubmit: async () => {
          throw failure;
        },
      });
      submit();
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, 0);
      await promise;

      expect(reported).toEqual([failure]);
    } finally {
      globalThis.reportError = originalReportError;
    }
  });
});
