import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ActionBar, ActionBarItem } from "./action-bar";

describe("action bar name", () => {
  test("a caller's aria-label names the toolbar instead of being replaced by the default label", () => {
    const html = renderToStaticMarkup(
      <ActionBar aria-label="Reply actions">
        <ActionBarItem>Retry</ActionBarItem>
      </ActionBar>,
    );
    expect(html).toContain('aria-label="Reply actions"');
    expect(html).not.toContain('aria-label="Message actions"');
  });

  test("the label prop still names the toolbar", () => {
    const html = renderToStaticMarkup(
      <ActionBar label="Draft actions">
        <ActionBarItem>Retry</ActionBarItem>
      </ActionBar>,
    );
    expect(html).toContain('aria-label="Draft actions"');
  });
});
