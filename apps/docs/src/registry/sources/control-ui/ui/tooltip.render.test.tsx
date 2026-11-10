import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Tooltip, TooltipTrigger } from "./tooltip";

describe("TooltipTrigger description", () => {
  test("a closed tooltip does not point the trigger at a missing description", () => {
    const html = renderToString(
      <Tooltip>
        <TooltipTrigger aria-label="Archive" />
      </Tooltip>,
    );

    expect(html).toContain('aria-label="Archive"');
    expect(html).not.toContain("aria-describedby");
  });

  test("the trigger keeps a description supplied by the caller", () => {
    const html = renderToString(
      <Tooltip>
        <TooltipTrigger aria-label="Archive" aria-describedby="archive-hint" />
      </Tooltip>,
    );

    expect(html).toContain('aria-describedby="archive-hint"');
  });
});
