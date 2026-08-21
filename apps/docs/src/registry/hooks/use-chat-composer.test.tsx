import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import type { ChatComposerProps } from "./use-chat-composer";
import { useChatComposer } from "./use-chat-composer";

type ComposerOptions = Pick<ChatComposerProps, "value" | "defaultValue" | "onValueChange" | "onSubmit" | "state" | "density" | "disabled">;

function renderComposerSubmit(options: ComposerOptions) {
  let submit: (() => void) | undefined;
  function Probe() {
    submit = useChatComposer(options).submit;
    return null;
  }
  renderToStaticMarkup(<Probe />);
  if (!submit) throw new Error("useChatComposer did not run");
  return submit;
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
