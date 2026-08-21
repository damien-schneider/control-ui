import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { AudioRecorder, AudioRecorderStatus, AudioRecorderTrigger, AudioRecorderVisualizer } from "./audio-recorder";

describe("AudioRecorder", () => {
  test("keeps inactive controls out of the interaction flow", () => {
    const html = renderToString(<AudioRecorder />);

    expect(html).toContain('data-control-ui="audio-recorder"');
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-state="idle"');
    expect(html).toContain('data-slot="content"');
    expect(html).toContain('data-slot="actions"');
    expect(html).not.toContain('data-visible="false"');
    for (const slot of ["status", "visualizer", "duration", "cancel", "submit"]) {
      expect(html).toMatch(new RegExp(`(?:data-slot="${slot}"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-slot="${slot}")`));
    }
    expect(html.match(/tabindex="-1"/g)).toHaveLength(2);
  });
  test("forwards retained knob styles to their painted compound parts", () => {
    const html = renderToString(
      <AudioRecorder style={{ "--cui-audio-recorder-foreground": "oklch(0.5 0.1 250)" }}>
        <AudioRecorderTrigger style={{ "--cui-audio-recorder-recording-ring-color": "oklch(0.7 0.15 250)" }} />
        <AudioRecorderVisualizer style={{ "--cui-audio-visualizer-bar-background": "oklch(0.6 0.12 250)" }} />
        <AudioRecorderStatus style={{ "--cui-audio-recorder-error-foreground": "oklch(0.6 0.2 20)" }} />
      </AudioRecorder>,
    );

    expect(html).toContain("--cui-audio-recorder-foreground:oklch(0.5 0.1 250)");
    expect(html).toContain("--cui-audio-recorder-recording-ring-color:oklch(0.7 0.15 250)");
    expect(html).toContain("--cui-audio-visualizer-bar-background:oklch(0.6 0.12 250)");
    expect(html).toContain("--cui-audio-recorder-error-foreground:oklch(0.6 0.2 20)");
  });
});
