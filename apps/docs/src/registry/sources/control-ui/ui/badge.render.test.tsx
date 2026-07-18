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
});
