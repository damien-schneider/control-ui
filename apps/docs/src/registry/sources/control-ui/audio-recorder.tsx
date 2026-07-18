"use client";

import { CheckIcon, MicIcon, XIcon } from "lucide-react";
import type { ComponentProps, MouseEvent } from "react";
import { createContext, use } from "react";
// Waveform: the AudioVisualizer usage family (bars is the default version). Swap the reading to the line
// version by pointing this import at ./audio-visualizer-line — same export, same contract, no call-site move.
import { AudioVisualizer } from "@/components/control-ui/audio-visualizer";
import type { UseAudioRecorderOptions, UseAudioRecorderResult } from "@/components/control-ui/hooks/use-audio-recorder";
import { useAudioRecorder } from "@/components/control-ui/hooks/use-audio-recorder";
import { cn } from "@/components/control-ui/lib/cn";
import { formatAudioRecorderDuration } from "@/components/control-ui/lib/format-audio-recorder-duration";
import { skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";

const AudioRecorderContext = createContext<UseAudioRecorderResult | null>(null);

const recorderContentMotion =
  "invisible translate-x-1 opacity-0 blur-xs transition-[opacity,filter,translate,visibility,color] transition-discrete duration-[var(--duration-base)] ease-[var(--ease-emphasized)] data-[visible=true]:visible data-[visible=true]:translate-x-0 data-[visible=true]:opacity-100 data-[visible=true]:blur-none";
const recorderControlMotion =
  "invisible translate-x-1 scale-95 opacity-0 blur-xs transition-[opacity,filter,translate,scale,visibility] transition-discrete duration-[var(--duration-base)] ease-[var(--ease-emphasized)] disabled:opacity-0 data-[visible=true]:visible data-[visible=true]:translate-x-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100 data-[visible=true]:blur-none";

// Public compound context (same seam as useChatInputContext): lets a call site stand its own part inside
// <AudioRecorder> — e.g. bind another AudioVisualizer version per instance where <AudioRecorderVisualizer />
// would sit. App-wide preference stays the one-line import swap in this owned file.
export function useAudioRecorderContext() {
  const context = use(AudioRecorderContext);
  if (!context) throw new Error("AudioRecorder compound components must be rendered inside <AudioRecorder>.");
  return context;
}

export type { AudioRecording } from "@/components/control-ui/hooks/use-audio-recorder";

// no bundled device picker: consumes `deviceId` only; pick mics via useAudioInputDevices + any list UI (see example's Combobox wiring)
export type AudioRecorderProps = ComponentProps<"div"> &
  UseAudioRecorderOptions & {
    label?: string;
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
        data-slot="root"
        data-state={recorder.state}
        data-disabled={recorder.isDisabled ? "true" : undefined}
        data-error={recorder.error ? "true" : undefined}
        role="group"
        aria-label={label}
        aria-disabled={recorder.isDisabled || undefined}
        className={cn(
          "flex min-h-8 w-full min-w-0 max-w-full items-center gap-2 pr-1 text-muted-foreground transition-colors duration-[var(--duration-base)] ease-[var(--ease-standard)]",
          "data-[state=recording]:text-foreground data-[state=recorded]:text-foreground",
          skinSlot("audio-recorder", "root", {}),
          className,
        )}
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
      <div data-control-ui="audio-recorder" data-slot="content" className="grid min-w-0 flex-1 items-center overflow-hidden">
        <AudioRecorderStatus className="col-start-1 row-start-1 w-full flex-none" />
        <AudioRecorderVisualizer points={points} className="col-start-1 row-start-1 w-full" />
      </div>
      <AudioRecorderDuration />
      <div data-control-ui="audio-recorder" data-slot="actions" className="flex shrink-0 items-center gap-1">
        <AudioRecorderCancel />
        <AudioRecorderSubmit />
      </div>
    </>
  );
}

export type AudioRecorderTriggerProps = ComponentProps<typeof Button>;

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
      className={cn(
        "data-[recorder-state=recording]:ring-2 data-[recorder-state=recording]:ring-destructive/25 data-[status-only=true]:cursor-default data-[status-only=true]:disabled:opacity-100",
        skinSlot("audio-recorder", "trigger", {}),
        className,
      )}
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
export type AudioRecorderVisualizerProps = Omit<ComponentProps<"div">, "children"> & {
  points?: number;
};

// Feeds the recorder's rolling level window into the installed AudioVisualizer version; the slot only owns
// state gating (hidden until a take starts) and the recorder anatomy hook, never the waveform rendering.
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
      className={cn(recorderContentMotion, skinSlot("audio-recorder", "visualizer", {}), className)}
      {...props}
    />
  );
}

export type AudioRecorderStatusProps = ComponentProps<"span">;

export function AudioRecorderStatus({ className, children, ...props }: AudioRecorderStatusProps) {
  const recorder = useAudioRecorderContext();
  const message = children ?? audioRecorderStatusMessage(recorder);
  const isVisible = Boolean(message);

  return (
    <span
      data-control-ui="audio-recorder"
      data-slot="status"
      data-visible={isVisible ? "true" : undefined}
      data-tone={recorder.state === "error" ? "error" : "neutral"}
      aria-hidden={!isVisible}
      aria-live="polite"
      className={cn(
        "min-w-0 flex-1 truncate text-meta text-muted-foreground data-[tone=error]:text-destructive-text",
        recorderContentMotion,
        skinSlot("audio-recorder", "status", {}),
        className,
      )}
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

export type AudioRecorderDurationProps = ComponentProps<"span">;

export function AudioRecorderDuration({ className, children, ...props }: AudioRecorderDurationProps) {
  const recorder = useAudioRecorderContext();
  const isVisible = recorder.state === "recording" || recorder.state === "recorded";

  return (
    <span
      data-control-ui="audio-recorder"
      data-slot="duration"
      data-visible={isVisible ? "true" : undefined}
      aria-hidden={!isVisible}
      className={cn(
        "w-10 shrink-0 text-right text-meta tabular-nums text-muted-foreground",
        recorderContentMotion,
        skinSlot("audio-recorder", "duration", {}),
        className,
      )}
      {...props}
    >
      {children ?? formatAudioRecorderDuration(recorder.durationMs)}
    </span>
  );
}

export type AudioRecorderCancelProps = ComponentProps<typeof Button>;

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
      className={cn(recorderControlMotion, skinSlot("audio-recorder", "cancel", {}), className)}
      onClick={handleClick}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="size-3.5" />}
    </Button>
  );
}

export type AudioRecorderSubmitProps = ComponentProps<typeof Button>;

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
      className={cn(recorderControlMotion, skinSlot("audio-recorder", "submit", {}), className)}
      onClick={handleClick}
      {...props}
    >
      {children ?? <CheckIcon aria-hidden="true" className="size-3.5" />}
    </Button>
  );
}
