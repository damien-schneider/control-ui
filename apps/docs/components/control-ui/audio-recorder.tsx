"use client";

import { CheckIcon, MicIcon, XIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent } from "react";
import { createContext, use } from "react";
// point this at ./audio-visualizer-line for line reading — same export, same contract, no call site moves
import { AudioVisualizer } from "@/components/control-ui/audio-visualizer";
import type { UseAudioRecorderOptions, UseAudioRecorderResult } from "@/components/control-ui/hooks/use-audio-recorder";
import { useAudioRecorder } from "@/components/control-ui/hooks/use-audio-recorder";
import type { AudioRecorderKnobStyle } from "@/components/control-ui/knob-contracts/audio-recorder-knobs";
import type { AudioVisualizerKnobStyle } from "@/components/control-ui/knob-contracts/audio-visualizer-knobs";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { formatAudioRecorderDuration } from "@/components/control-ui/lib/format-audio-recorder-duration";
import { Button } from "@/components/control-ui/ui/button";

type AudioRecorderStyleProps<Props, Style> = Omit<Props, "style"> & {
  style?: CSSProperties & Style;
};

const AudioRecorderContext = createContext<UseAudioRecorderResult | null>(null);

// lets call site stand its own part inside <AudioRecorder>, e.g. different visualizer per instance
export function useAudioRecorderContext() {
  const context = use(AudioRecorderContext);
  if (!context) throw new Error("AudioRecorder compound components must be rendered inside <AudioRecorder>.");
  return context;
}

export type { AudioRecording } from "@/components/control-ui/hooks/use-audio-recorder";

// no bundled device picker — pair `deviceId` with useAudioInputDevices and any list UI
export type AudioRecorderProps = Omit<ComponentProps<"div">, "style"> &
  UseAudioRecorderOptions & {
    label?: string;
    style?: CSSProperties & AudioRecorderKnobStyle;
  };

export function AudioRecorder({
  onRecordingComplete,
  onCancel,
  maxDurationMs,
  disabled,
  barCount,
  barDurationMs,
  deviceId,
  label = "Voice recorder",
  className,
  children,
  ...props
}: AudioRecorderProps) {
  const recorder = useAudioRecorder({ onRecordingComplete, onCancel, maxDurationMs, disabled, barCount, barDurationMs, deviceId });

  return (
    <AudioRecorderContext.Provider value={recorder}>
      {/* biome-ignore lint/a11y/useSemanticElements: toolbar-like group, not a form fieldset */}
      <div
        data-control-ui="audio-recorder"
        data-control-family="audio-recorder"
        data-slot="root"
        data-state={recorder.state}
        data-disabled={recorder.isDisabled ? "true" : undefined}
        data-error={recorder.error ? "true" : undefined}
        role="group"
        aria-label={label}
        aria-disabled={recorder.isDisabled || undefined}
        className={cn("flex min-h-8 w-full min-w-0 max-w-full items-center gap-2 pr-1", className)}
        {...props}
      >
        {children ?? <AudioRecorderDefaultLayout points={barCount} />}
      </div>
    </AudioRecorderContext.Provider>
  );
}

function AudioRecorderDefaultLayout({ points }: { points?: number }) {
  return (
    <>
      <AudioRecorderTrigger />
      <div
        data-control-ui="audio-recorder"
        data-control-family="audio-recorder"
        data-slot="content"
        className="grid min-w-0 flex-1 items-center overflow-hidden"
      >
        <AudioRecorderStatus className="col-start-1 row-start-1 w-full flex-none" />
        <AudioRecorderVisualizer points={points} className="col-start-1 row-start-1 w-full" />
      </div>
      <AudioRecorderDuration />
      <div
        data-control-ui="audio-recorder"
        data-control-family="audio-recorder"
        data-slot="actions"
        className="flex shrink-0 items-center gap-1"
      >
        <AudioRecorderCancel />
        <AudioRecorderSubmit />
      </div>
    </>
  );
}

export type AudioRecorderTriggerProps = AudioRecorderStyleProps<ComponentProps<typeof Button>, ButtonKnobStyle & AudioRecorderKnobStyle>;

export function AudioRecorderTrigger({ className, children, disabled, onClick, ...props }: AudioRecorderTriggerProps) {
  const recorder = useAudioRecorderContext();
  const isActive =
    recorder.state === "requesting" || recorder.state === "recording" || recorder.state === "recorded" || recorder.state === "submitting";
  const isStatusOnly =
    !recorder.canStart &&
    (recorder.state === "requesting" || recorder.state === "recording" || recorder.state === "recorded" || recorder.state === "submitting");
  const triggerVariant = audioRecorderTriggerVariant(recorder, isActive);
  const triggerTone = audioRecorderTriggerTone(recorder);
  const ariaLabel = audioRecorderTriggerLabel(recorder);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && recorder.canStart) await recorder.start();
  }

  return (
    <Button
      data-control-ui="audio-recorder"
      data-slot="trigger"
      data-recorder-state={recorder.state}
      data-status-only={isStatusOnly ? "true" : undefined}
      type="button"
      variant={triggerVariant}
      tone={triggerTone}
      active={isActive}
      size="sm"
      iconOnly
      shape="circle"
      aria-label={ariaLabel}
      title={recorder.error?.message}
      disabled={disabled ?? (recorder.isDisabled || !recorder.canStart)}
      className={cn("data-[status-only=true]:cursor-default", className)}
      onClick={handleClick}
      {...props}
    >
      {children ?? <MicIcon aria-hidden="true" className="size-3.5" />}
    </Button>
  );
}

function audioRecorderTriggerVariant(recorder: UseAudioRecorderResult, isActive: boolean) {
  if (recorder.state === "recording") return "solid";
  if (isActive) return "surface";
  return "quiet";
}

function audioRecorderTriggerTone(recorder: UseAudioRecorderResult) {
  if (recorder.state === "recording" || recorder.state === "error") return "danger";
  if (recorder.state === "requesting" || recorder.state === "submitting") return "primary";
  return "neutral";
}

function audioRecorderTriggerLabel(recorder: UseAudioRecorderResult) {
  switch (recorder.state) {
    case "requesting":
      return "Requesting microphone permission";
    case "recording":
      return "Recording voice";
    case "recorded":
      return "Voice recording ready";
    case "submitting":
      return "Sending voice recording";
    default:
      return recorder.error ? "Retry voice recording" : "Start voice recording";
  }
}
export type AudioRecorderVisualizerProps = AudioRecorderStyleProps<
  Omit<ComponentProps<"div">, "children">,
  AudioVisualizerKnobStyle & AudioRecorderKnobStyle
> & {
  points?: number;
};

// owns only state gating and recorder anatomy hook, never waveform rendering
export function AudioRecorderVisualizer({ points, className, ...props }: AudioRecorderVisualizerProps) {
  const recorder = useAudioRecorderContext();
  const isVisible = recorder.state === "recording" || recorder.state === "recorded";

  return (
    <AudioVisualizer
      data-control-ui="audio-recorder"
      data-slot="visualizer"
      data-visible={isVisible ? "true" : undefined}
      active={recorder.state === "recording"}
      levels={recorder.levels}
      points={points}
      aria-hidden={!isVisible}
      className={className}
      {...props}
    />
  );
}

export type AudioRecorderStatusProps = AudioRecorderStyleProps<ComponentProps<"span">, AudioRecorderKnobStyle>;

export function AudioRecorderStatus({ className, children, ...props }: AudioRecorderStatusProps) {
  const recorder = useAudioRecorderContext();
  const message = children ?? audioRecorderStatusMessage(recorder);
  const isVisible = Boolean(message);

  return (
    <span
      data-control-ui="audio-recorder"
      data-control-family="audio-recorder"
      data-slot="status"
      data-visible={isVisible ? "true" : undefined}
      data-tone={recorder.state === "error" ? "error" : "neutral"}
      aria-hidden={!isVisible}
      aria-live="polite"
      className={cn("min-w-0 flex-1 truncate", className)}
      {...props}
    >
      {message}
    </span>
  );
}

function audioRecorderStatusMessage(recorder: UseAudioRecorderResult) {
  if (recorder.state === "requesting") return "Allow microphone access";
  if (recorder.state === "submitting") return "Sending voice recording";
  if (recorder.state === "error") return recorder.error?.message;
  return null;
}

export type AudioRecorderDurationProps = AudioRecorderStyleProps<ComponentProps<"span">, AudioRecorderKnobStyle>;

export function AudioRecorderDuration({ className, children, ...props }: AudioRecorderDurationProps) {
  const recorder = useAudioRecorderContext();
  const isVisible = recorder.state === "recording" || recorder.state === "recorded";

  return (
    <span
      data-control-ui="audio-recorder"
      data-control-family="audio-recorder"
      data-slot="duration"
      data-visible={isVisible ? "true" : undefined}
      aria-hidden={!isVisible}
      className={cn("w-10 shrink-0", className)}
      {...props}
    >
      {children ?? formatAudioRecorderDuration(recorder.durationMs)}
    </span>
  );
}

export type AudioRecorderCancelProps = AudioRecorderStyleProps<ComponentProps<typeof Button>, ButtonKnobStyle & AudioRecorderKnobStyle>;

export function AudioRecorderCancel({ className, children, disabled, onClick, tabIndex, ...props }: AudioRecorderCancelProps) {
  const recorder = useAudioRecorderContext();
  const isVisible = recorder.canCancel;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && recorder.canCancel) recorder.cancel();
  }

  return (
    <Button
      data-control-ui="audio-recorder"
      data-slot="cancel"
      data-visible={isVisible ? "true" : undefined}
      type="button"
      variant="quiet"
      tone="danger"
      size="sm"
      iconOnly
      shape="circle"
      aria-label="Cancel voice recording"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? tabIndex : -1}
      disabled={disabled ?? (recorder.isDisabled || !isVisible)}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="size-3.5" />}
    </Button>
  );
}

export type AudioRecorderSubmitProps = AudioRecorderStyleProps<ComponentProps<typeof Button>, ButtonKnobStyle & AudioRecorderKnobStyle>;

export function AudioRecorderSubmit({ className, children, disabled, onClick, tabIndex, ...props }: AudioRecorderSubmitProps) {
  const recorder = useAudioRecorderContext();
  const isVisible = recorder.canSubmit;

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && recorder.canSubmit) await recorder.submit();
  }

  return (
    <Button
      data-control-ui="audio-recorder"
      data-slot="submit"
      data-visible={isVisible ? "true" : undefined}
      type="button"
      variant="solid"
      tone="primary"
      size="sm"
      iconOnly
      shape="circle"
      aria-label="Send voice recording"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? tabIndex : -1}
      disabled={disabled ?? (recorder.state === "submitting" || !isVisible)}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children ?? <CheckIcon aria-hidden="true" className="size-3.5" />}
    </Button>
  );
}
