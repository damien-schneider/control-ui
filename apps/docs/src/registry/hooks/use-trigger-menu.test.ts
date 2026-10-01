import { describe, expect, test } from "bun:test";

import { CLOSED_TRIGGER_MENU, isComposingKey, triggerMenuKeyIntent, triggerMenuReducer } from "./use-trigger-menu";

const mention = { char: "@", query: "sa", start: 4, end: 7 };

function openAt(match: typeof mention) {
  return triggerMenuReducer(CLOSED_TRIGGER_MENU, { type: "report", match, anchorRect: null });
}

describe("triggerMenuReducer", () => {
  test("a token dismissed with Escape stays closed when the binding re-detects it on keyup", () => {
    const dismissed = triggerMenuReducer(openAt(mention), {
      type: "close",
      dismissed: { char: mention.char, start: mention.start, query: mention.query },
    });

    const redetected = triggerMenuReducer(dismissed, { type: "report", match: mention, anchorRect: null });
    expect(redetected.open).toBe(false);
  });

  test("a dismissed token reopens once its query changes, and a new token opens normally", () => {
    const dismissed = triggerMenuReducer(openAt(mention), {
      type: "close",
      dismissed: { char: mention.char, start: mention.start, query: mention.query },
    });

    expect(triggerMenuReducer(dismissed, { type: "report", match: { ...mention, query: "sam", end: 8 }, anchorRect: null }).open).toBe(
      true,
    );
    expect(triggerMenuReducer(dismissed, { type: "report", match: { ...mention, start: 12, end: 15 }, anchorRect: null }).open).toBe(true);
  });

  test("leaving the token clears the dismissal, so typing the same token again opens it", () => {
    const dismissed = triggerMenuReducer(openAt(mention), {
      type: "close",
      dismissed: { char: mention.char, start: mention.start, query: mention.query },
    });
    const left = triggerMenuReducer(dismissed, { type: "report", match: null, anchorRect: null });

    expect(triggerMenuReducer(left, { type: "report", match: mention, anchorRect: null }).open).toBe(true);
  });

  test("keeps the highlighted option while the query is unchanged and resets it when the query changes", () => {
    const moved = triggerMenuReducer(openAt(mention), { type: "move", delta: 1, count: 3 });
    expect(moved.activeIndex).toBe(1);
    expect(triggerMenuReducer(moved, { type: "report", match: mention, anchorRect: null }).activeIndex).toBe(1);
    expect(triggerMenuReducer(moved, { type: "report", match: { ...mention, query: "s" }, anchorRect: null }).activeIndex).toBe(0);
  });
});

describe("triggerMenuKeyIntent", () => {
  test("an open menu with no matches lets Enter and Tab through, so newline, submit and Tab-out still work", () => {
    expect(triggerMenuKeyIntent("Enter", true, 0)).toBe("pass");
    expect(triggerMenuKeyIntent("Tab", true, 0)).toBe("pass");
    expect(triggerMenuKeyIntent("Enter", true, 2)).toBe("commit");
    expect(triggerMenuKeyIntent("Escape", true, 0)).toBe("dismiss");
    expect(triggerMenuKeyIntent("Enter", false, 2)).toBe("pass");
  });
});

describe("isComposingKey", () => {
  test("treats Safari's post-compositionend commit key (keyCode 229) as still composing", () => {
    expect(isComposingKey({ isComposing: false, keyCode: 229 })).toBe(true);
    expect(isComposingKey({ isComposing: true, keyCode: 13 })).toBe(true);
    expect(isComposingKey({ isComposing: false, keyCode: 13 })).toBe(false);
  });
});
