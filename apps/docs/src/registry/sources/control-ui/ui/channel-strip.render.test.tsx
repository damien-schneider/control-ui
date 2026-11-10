import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { ChannelStrip, ChannelStripHeader, ChannelStripTitle } from "./channel-strip";

const GROUP_LABELLED_BY = /role="group" aria-labelledby="([^"]+)"/;

test("a channel strip is a group named by its title", () => {
  const html = renderToString(
    <ChannelStrip>
      <ChannelStripHeader>
        <ChannelStripTitle>Shure MV7+</ChannelStripTitle>
      </ChannelStripHeader>
    </ChannelStrip>,
  );
  const labelledBy = html.match(GROUP_LABELLED_BY)?.[1];
  expect(labelledBy).toBeDefined();
  expect(html).toContain(`id="${labelledBy}"`);
});

test("an explicit aria-label names the strip instead of its title", () => {
  const html = renderToString(
    <ChannelStrip aria-label="Channel 1, Shure MV7+">
      <ChannelStripHeader>
        <ChannelStripTitle>Shure MV7+</ChannelStripTitle>
      </ChannelStripHeader>
    </ChannelStrip>,
  );
  expect(html).toContain('aria-label="Channel 1, Shure MV7+"');
  expect(html).not.toContain("aria-labelledby");
});

test("a title outside a channel strip keeps its own id", () => {
  expect(renderToString(<ChannelStripTitle id="input-name">Shure MV7+</ChannelStripTitle>)).toContain('id="input-name"');
});
