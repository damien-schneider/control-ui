import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const COMPONENT = readFileSync(new URL("./audio-recorder.tsx", import.meta.url), "utf8");
const HOOK = readFileSync(new URL("../../hooks/use-audio-recorder.ts", import.meta.url), "utf8");
const MANIFEST = readFileSync(new URL("../../../../registry/control-ui/audio-recorder.json", import.meta.url), "utf8");
const CHAT_MANIFEST = readFileSync(new URL("../../../../registry/control-ui/chat.json", import.meta.url), "utf8");

describe("audio recorder registry contract", () => {
  test("core source stays runtime agnostic", () => {
    const refToken = ["forward", "Ref"].join("");
    const mastraToken = ["@mastra", "/"].join("");
    // built at runtime so this literal doesn't trip validate-registry's ai-sdk import scan
    const aiImportToken = ["from ", '"ai"'].join("");
    expect(COMPONENT).not.toContain(mastraToken);
    expect(COMPONENT).not.toContain(aiImportToken);
    expect(COMPONENT).not.toContain(refToken);
    expect(HOOK).not.toContain(mastraToken);
    expect(HOOK).not.toContain(aiImportToken);
    expect(HOOK).not.toContain(refToken);
  });

  test("visibility is expressed as rendered state without a canvas dependency", () => {
    expect(COMPONENT).toContain('data-visible={isVisible ? "true" : undefined}');
    expect(COMPONENT).not.toContain("<canvas");
  });

  test("exposes content and action regions", () => {
    expect(COMPONENT).toContain('data-slot="content"');
    expect(COMPONENT).toContain('data-slot="actions"');
  });

  test("waveform delegates to the AudioVisualizer usage family", () => {
    // the recorder slot only gates state and stamps its anatomy hook; rendering lives in the installed version
    expect(COMPONENT).toContain('from "@/components/control-ui/audio-visualizer"');
    expect(COMPONENT).toContain('data-slot="visualizer"');
    expect(COMPONENT).not.toContain("--audio-recorder-level");
    expect(MANIFEST).toContain('"audio-visualizer"');
    // per-instance seam: the compound context is public so a call site can stand another version's part
    expect(COMPONENT).toContain("export function useAudioRecorderContext");
  });

  test("non-actionable recorder controls are disabled and explain state", () => {
    expect(COMPONENT).toContain("disabled={disabled ?? (recorder.isDisabled || !recorder.canStart)}");
    expect(COMPONENT).toContain('data-status-only={isStatusOnly ? "true" : undefined}');
    expect(COMPONENT).toContain("AudioRecorderStatus");
  });

  test("device selection is delegated to the hook, not bundled as a picker", () => {
    // recorder takes deviceId only; mic selection lives in useAudioInputDevices for BYO list UI
    expect(HOOK).toContain("export function useAudioInputDevices");
    expect(HOOK).toContain("export function formatAudioInputDeviceLabel");
    expect(COMPONENT).not.toContain("DevicePicker");
    expect(COMPONENT).not.toContain("Popover");
    expect(COMPONENT).not.toContain("Command");
  });

  test("standalone manifest includes recorder source and hook", () => {
    expect(MANIFEST).toContain("src/registry/hooks/use-audio-recorder.ts");
    expect(MANIFEST).toContain("src/registry/sources/control-ui/audio-recorder.tsx");
  });

  test("chat manifest does not pull in the recorder accessory", () => {
    expect(CHAT_MANIFEST).not.toContain("src/registry/hooks/use-audio-recorder.ts");
    expect(CHAT_MANIFEST).not.toContain("src/registry/sources/control-ui/audio-recorder.tsx");
  });
});
