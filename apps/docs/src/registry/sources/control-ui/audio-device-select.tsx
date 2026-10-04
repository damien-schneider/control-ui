"use client";

import { MicIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, use, useState } from "react";
import type { AudioDeviceSelectKnobStyle } from "@/components/control-ui/knob-contracts/audio-device-select-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import type { SelectProps, SelectTriggerProps } from "@/components/control-ui/ui/select";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/control-ui/ui/select";

export type AudioDevice = {
  deviceId: string;
  label: string;
  isDefault?: boolean;
  status?: "available" | "unavailable" | "permission-required";
};

export type AudioDevicePermission = "granted" | "prompt" | "denied";

export type AudioDeviceSelectProps = Omit<SelectProps, "items" | "children"> & {
  devices: readonly AudioDevice[];
  loading?: boolean;
  permission?: AudioDevicePermission;
  onRequestPermission?: () => void | Promise<void>;
  allowNone?: boolean;
  noneLabel?: string;
  label?: string;
  error?: string | null;
  className?: string;
  children?: ReactNode;
};

type AudioDeviceSelectContextValue = {
  devices: readonly AudioDevice[];
  selected: AudioDevice | null;
  value: string | null;
  missing: boolean;
  loading: boolean;
  permission: AudioDevicePermission;
  disabled: boolean;
  allowNone: boolean;
  noneLabel: string;
  label: string;
  error: string | null;
  onRequestPermission?: () => void | Promise<void>;
};

const AudioDeviceSelectContext = createContext<AudioDeviceSelectContextValue | null>(null);

function useAudioDeviceSelect() {
  const context = use(AudioDeviceSelectContext);
  if (!context) throw new Error("AudioDeviceSelect parts must be rendered inside AudioDeviceSelect.");
  return context;
}

function deviceLabel(device: AudioDevice, index = 0) {
  return device.label.trim() || `Microphone ${index + 1}`;
}

export function AudioDeviceSelect({
  devices,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  loading = false,
  permission = "granted",
  onRequestPermission,
  allowNone = false,
  noneLabel = "No microphone",
  label = "Microphone",
  error = null,
  className,
  children,
  ...props
}: AudioDeviceSelectProps) {
  const [internalValue, setInternalValue] = useState<string | null>(() => defaultValue ?? null);
  const current = value === undefined ? internalValue : value;
  const connected = devices.find((device) => device.deviceId === current) ?? null;
  const [remembered, setRemembered] = useState<AudioDevice | null>(connected);
  if (connected && (remembered?.deviceId !== connected.deviceId || remembered?.label !== connected.label)) setRemembered(connected);
  const missing = current !== null && !(allowNone && current === "") && !connected && !loading;
  const selected = connected ?? (remembered?.deviceId === current ? remembered : null);

  function handleValueChange(next: string) {
    setInternalValue(next);
    onValueChange?.(next);
  }

  return (
    <AudioDeviceSelectContext.Provider
      value={{
        devices,
        selected,
        value: current,
        missing,
        loading,
        permission,
        disabled,
        allowNone,
        noneLabel,
        label,
        error,
        onRequestPermission,
      }}
    >
      <div
        data-control-ui="audio-device-select"
        data-control-family="audio-device-select"
        data-slot="root"
        className={cn("grid min-w-0 gap-2", className)}
      >
        <Select value={current} onValueChange={handleValueChange} disabled={disabled || loading} {...props}>
          {children ?? (
            <>
              <AudioDeviceSelectTrigger />
              <AudioDeviceSelectContent />
              <AudioDeviceSelectStatus />
              <AudioDeviceSelectPermission />
            </>
          )}
        </Select>
      </div>
    </AudioDeviceSelectContext.Provider>
  );
}

export function AudioDeviceSelectTrigger({ children, className, ...props }: SelectTriggerProps) {
  const context = useAudioDeviceSelect();
  return (
    <SelectTrigger
      data-control-ui="audio-device-select"
      data-slot="trigger"
      data-loading={context.loading ? "true" : undefined}
      data-permission={context.permission}
      data-missing={context.missing ? "true" : undefined}
      aria-label={context.label}
      aria-busy={context.loading || undefined}
      className={cn("w-full", className)}
      {...props}
    >
      {children ?? (
        <>
          <MicIcon aria-hidden="true" className="size-4 shrink-0" />
          <AudioDeviceSelectValue />
        </>
      )}
    </SelectTrigger>
  );
}

export function AudioDeviceSelectValue({ placeholder = "Select a microphone" }: { placeholder?: string }) {
  const context = useAudioDeviceSelect();
  let text = placeholder;
  if (context.selected) text = deviceLabel(context.selected, context.devices.indexOf(context.selected));
  if (context.allowNone && context.value === "") text = context.noneLabel;
  if (context.missing) text = `${context.selected ? deviceLabel(context.selected) : "Unknown device"} (disconnected)`;
  if (context.loading) text = "Finding devices…";
  return (
    <span data-control-ui="audio-device-select" data-slot="value" className="min-w-0 truncate" title={text}>
      {text}
    </span>
  );
}

export function AudioDeviceSelectContent({ children, ...props }: ComponentProps<typeof SelectContent>) {
  const context = useAudioDeviceSelect();
  return (
    <SelectContent data-control-ui="audio-device-select" data-slot="content" {...props}>
      {children ?? (
        <>
          {context.allowNone ? <SelectItem value="">{context.noneLabel}</SelectItem> : null}
          {context.missing ? (
            <SelectItem value={context.value ?? ""} disabled>
              <AudioDeviceSelectValue />
            </SelectItem>
          ) : null}
          {context.devices
            .filter((device) => !context.allowNone || device.deviceId !== "")
            .map((device, index) => (
              <AudioDeviceSelectItem
                key={device.deviceId}
                value={device.deviceId}
                label={deviceLabel(device, index)}
                disabled={device.status === "unavailable" || device.status === "permission-required"}
              >
                <span className="min-w-0 flex-1 truncate">{deviceLabel(device, index)}</span>
                {device.isDefault || device.deviceId === "default" ? (
                  <span className="ms-3 text-caption text-muted-foreground">Default</span>
                ) : null}
              </AudioDeviceSelectItem>
            ))}
          {context.devices.length === 0 && !context.missing && !context.allowNone ? (
            <SelectItem value="__audio-device-empty__" disabled>
              {context.permission === "granted" ? "No microphones found" : "Allow microphone access to find devices"}
            </SelectItem>
          ) : null}
        </>
      )}
    </SelectContent>
  );
}

export function AudioDeviceSelectItem(props: ComponentProps<typeof SelectItem>) {
  return <SelectItem data-control-ui="audio-device-select" data-slot="item" {...props} />;
}

export function AudioDeviceSelectPreview({ className, ...props }: ComponentProps<"div">) {
  return <div data-control-ui="audio-device-select" data-slot="preview" className={cn("min-w-0", className)} {...props} />;
}

export type AudioDeviceSelectStatusProps = Omit<ComponentProps<"p">, "style"> & {
  style?: CSSProperties & AudioDeviceSelectKnobStyle;
};

export function AudioDeviceSelectStatus({ className, ...props }: AudioDeviceSelectStatusProps) {
  const context = useAudioDeviceSelect();
  let message = context.error;
  if (!message && context.permission === "denied") message = "Microphone access is blocked. Allow it in your browser’s site settings.";
  if (!message && context.missing) message = "This microphone is disconnected. Reconnect it or choose another device.";
  if (!message) return null;
  return (
    <p
      data-control-ui="audio-device-select"
      data-control-family="audio-device-select"
      data-slot="status"
      role="status"
      className={cn("text-caption", className)}
      {...props}
    >
      {message}
    </p>
  );
}

export function AudioDeviceSelectPermission({ children = "Allow microphone access", onClick, ...props }: ComponentProps<typeof Button>) {
  const context = useAudioDeviceSelect();
  if (context.permission !== "prompt" || !context.onRequestPermission) return null;
  return (
    <Button
      data-control-ui="audio-device-select"
      data-slot="permission"
      variant="surface"
      size="sm"
      disabled={context.disabled || context.loading}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) void context.onRequestPermission?.();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
