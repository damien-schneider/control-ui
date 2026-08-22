import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Badge } from "./badge";

describe("Badge", () => {
  test("emits its semantic size state", () => {
    const small = renderToString(<Badge size="sm">Alpha</Badge>);
    const defaultSize = renderToString(<Badge>Default</Badge>);

    expect(small).toContain('data-size="sm"');
    expect(defaultSize).toContain('data-size="md"');
  });

  test("keeps treatment and semantic color independent", () => {
    const red = renderToString(<Badge color="red">Denied</Badge>);
    const outline = renderToString(<Badge variant="outline">Outline</Badge>);

    expect(red).toContain('data-variant="default"');
    expect(red).toContain('data-color="red"');
    expect(outline).toContain('data-variant="outline"');
    expect(outline).toContain('data-color="neutral"');
  });
});
