import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/primitives/button");
});

test("knobs set on a family root paint pseudo-elements", async ({ page }) => {
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div data-control-family="chat-composer" data-control-ui="chat-composer" data-slot="root" style="--cui-chat-composer-input-placeholder-foreground: rgb(4 5 6)">
          <textarea id="composer-placeholder" data-control-family="chat-composer" data-control-ui="chat-composer" data-slot="textarea" placeholder="Composer"></textarea>
          <textarea id="composer-slot-placeholder" data-control-family="chat-composer" data-control-ui="chat-composer" data-slot="textarea" placeholder="Slot" style="--cui-chat-composer-input-placeholder-foreground: rgb(40 50 60)"></textarea>
        </div>
        <div id="transcript-divider" data-control-family="transcript-divider" data-control-ui="transcript-divider" data-slot="root" style="--cui-transcript-divider-line-color: rgb(13 14 15)"></div>
      `,
    );
  });

  const colors = await page.evaluate(() => {
    const pseudoColor = (id: string, pseudo: string, property: "color" | "backgroundColor") => {
      const element = document.getElementById(id);
      if (!element) throw new Error(`Missing ${id}`);
      return getComputedStyle(element, pseudo)[property];
    };

    return {
      inheritedPlaceholder: pseudoColor("composer-placeholder", "::placeholder", "color"),
      slotPlaceholder: pseudoColor("composer-slot-placeholder", "::placeholder", "color"),
      dividerBefore: pseudoColor("transcript-divider", "::before", "backgroundColor"),
      dividerAfter: pseudoColor("transcript-divider", "::after", "backgroundColor"),
    };
  });

  expect(colors).toEqual({
    inheritedPlaceholder: "rgb(4, 5, 6)",
    slotPlaceholder: "rgb(40, 50, 60)",
    dividerBefore: "rgb(13, 14, 15)",
    dividerAfter: "rgb(13, 14, 15)",
  });
});

test("knobs set on a family root reach every descendant slot", async ({ page }) => {
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div data-control-family="chat-composer" data-control-ui="chat-composer" data-slot="root" style="--cui-chat-composer-shell-background: rgb(24 25 26)">
          <div id="composer-shell" data-control-family="chat-composer" data-control-ui="chat-composer" data-slot="shell"></div>
        </div>
        <section data-control-family="chat-layout" data-control-ui="chat-layout" data-slot="root" style="--cui-chat-layout-thought-foreground: rgb(27 28 29)">
          <button id="chat-thought" data-control-family="chat-layout" data-control-ui="chat-thought" data-slot="trigger">Thought</button>
        </section>
        <div data-control-family="code" data-control-ui="code" data-slot="root" style="--cui-code-title-foreground: rgb(30 31 32)">
          <span id="code-title" data-control-family="code" data-control-ui="code" data-slot="title">Code</span>
        </div>
        <div data-control-family="inline-attachment" data-control-ui="inline-attachment" data-slot="root" style="--cui-inline-attachment-content-foreground: rgb(33 34 35)">
          <span id="inline-attachment-content" data-control-family="inline-attachment" data-control-ui="inline-attachment" data-slot="content">Content</span>
        </div>
        <article data-control-family="inline-citation" data-control-ui="inline-citation" data-slot="source" style="--cui-inline-citation-quote-background: rgb(39 40 41); --cui-inline-citation-quote-radius: 17px">
          <blockquote id="inline-citation-quote" data-control-family="inline-citation" data-control-ui="inline-citation" data-slot="source-quote">Quote</blockquote>
        </article>
        <div data-control-family="task-list" data-control-ui="task-list" data-slot="root" style="--cui-task-list-item-foreground: rgb(36 37 38)">
          <span id="task-list-item" data-control-family="task-list" data-control-ui="task-list" data-slot="item">Task</span>
        </div>
      `,
    );
  });

  const styles = await page.evaluate(() => {
    const style = (id: string) => {
      const element = document.getElementById(id);
      if (!element) throw new Error(`Missing ${id}`);
      return getComputedStyle(element);
    };

    return {
      composerShell: style("composer-shell").backgroundColor,
      chatThought: style("chat-thought").color,
      codeTitle: style("code-title").color,
      inlineAttachmentContent: style("inline-attachment-content").color,
      inlineCitationQuote: {
        background: style("inline-citation-quote").backgroundColor,
        radius: style("inline-citation-quote").borderRadius,
      },
      taskListItem: style("task-list-item").color,
    };
  });

  expect(styles).toEqual({
    composerShell: "rgb(24, 25, 26)",
    chatThought: "rgb(27, 28, 29)",
    codeTitle: "rgb(30, 31, 32)",
    inlineAttachmentContent: "rgb(33, 34, 35)",
    inlineCitationQuote: { background: "rgb(39, 40, 41)", radius: "17px" },
    taskListItem: "rgb(36, 37, 38)",
  });
});
