import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Button } from "./button";

describe("Button rendered element", () => {
  test("preserves an anchor passed through asChild", () => {
    const html = renderToString(
      <Button asChild>
        <a href="/docs">Documentation</a>
      </Button>,
    );

    expect(html).toStartWith("<a");
    expect(html).toContain('href="/docs"');
    expect(html).not.toContain("<button");
  });
});
