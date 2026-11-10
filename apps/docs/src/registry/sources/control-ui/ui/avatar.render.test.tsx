import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup } from "./avatar";

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
});

describe("AvatarBadge", () => {
  test("names a status that is otherwise only a colour", () => {
    const html = renderToString(
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge status="busy" />
      </Avatar>,
    );

    expect(html).toContain('<span class="sr-only">busy</span>');
  });

  test("stays silent when the label is emptied or no status is set", () => {
    const html = renderToString(
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge status="busy" label="" />
        <AvatarBadge>3</AvatarBadge>
      </Avatar>,
    );

    expect(html).not.toContain("sr-only");
  });
});
