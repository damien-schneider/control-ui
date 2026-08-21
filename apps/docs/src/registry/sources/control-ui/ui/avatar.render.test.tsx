import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Avatar, AvatarFallback, AvatarGroup } from "./avatar";

describe("AvatarGroup", () => {
  test("groups composed avatars under one accessible label", () => {
    const html = renderToString(
      <AvatarGroup aria-label="Project contributors">
        <Avatar>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>DS</AvatarFallback>
        </Avatar>
      </AvatarGroup>,
    );

    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Project contributors"');
    expect(html).toContain('data-slot="group"');
    expect(html.match(/data-slot="root"/g)).toHaveLength(2);
  });

  test("forwards family knob styles to each public root", () => {
    const html = renderToString(
      <Avatar style={{ "--cui-avatar-fallback-background": "rgb(1 2 3)" }}>
        <AvatarFallback style={{ "--cui-avatar-fallback-background": "rgb(4 5 6)" }}>AL</AvatarFallback>
      </Avatar>,
    );

    expect(html).toContain("--cui-avatar-fallback-background:rgb(1 2 3)");
    expect(html).toContain("--cui-avatar-fallback-background:rgb(4 5 6)");
  });
});
