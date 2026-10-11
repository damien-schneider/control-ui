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
