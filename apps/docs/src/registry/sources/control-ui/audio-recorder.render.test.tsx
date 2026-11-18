import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { AudioRecorder } from "./audio-recorder";

describe("AudioRecorder", () => {
  test("keeps inactive controls out of the interaction flow", () => {
    const html = renderToString(<AudioRecorder />);

    for (const slot of ["status", "visualizer", "duration", "cancel", "submit"]) {
      expect(html).toMatch(new RegExp(`(?:data-slot="${slot}"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-slot="${slot}")`));
    }
    expect(html.match(/tabindex="-1"/g)).toHaveLength(2);
  });
});
