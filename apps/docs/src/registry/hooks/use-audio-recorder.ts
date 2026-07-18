import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";

export type AudioRecorderState = "idle" | "requesting" | "recording" | "recorded" | "submitting" | "error";

export type AudioRecording = {
  blob: Blob;
  url: string;
  durationMs: number;
  mimeType: string;
};

export type UseAudioRecorderOptions = {
  onRecordingComplete?: (recording: AudioRecording) => void | Promise<void>;
  onCancel?: () => void;
  maxDurationMs?: number;
  disabled?: boolean;
  barCount?: number;
  barDurationMs?: number;
  deviceId?: string;
};

export type AudioRecorderSnapshot = {
  state: AudioRecorderState;
  durationMs: number;
  levels: number[];
  error: Error | null;
  recording?: AudioRecording;
};

export type UseAudioRecorderResult = AudioRecorderSnapshot & {
  isDisabled: boolean;
  canStart: boolean;
  canCancel: boolean;
  canSubmit: boolean;
  start: () => Promise<boolean>;
  stop: () => Promise<AudioRecording | null>;
  cancel: () => void;
  submit: () => Promise<AudioRecording | null>;
};

export type UseAudioInputDevicesResult = {
  devices: MediaDeviceInfo[];
  loading: boolean;
  error: Error | null;
  hasPermission: boolean;
  refresh: () => Promise<void>;
  requestPermission: () => Promise<void>;
};

// Minimal structural contracts for everything the controller touches, so tests can inject
// plain mocks while the real DOM constructors stay assignable.
export type AudioRecorderStreamLike = {
  getTracks: () => readonly { stop: () => void }[];
};

type MediaRecorderLike = {
  state: string;
  mimeType: string;
  ondataavailable: ((event: BlobEvent) => void) | null;
  onstop: ((event: Event) => void) | null;
  start(timeslice?: number): void;
  stop(): void;
};

type MediaRecorderConstructor<TStream extends AudioRecorderStreamLike> = {
  new (stream: TStream, options?: MediaRecorderOptions): MediaRecorderLike;
  isTypeSupported?: (mimeType: string) => boolean;
};

type AnalyserLike = {
  fftSize: number;
  smoothingTimeConstant: number;
  getByteTimeDomainData(samples: Uint8Array<ArrayBuffer>): void;
};

type AudioSourceLike = {
  // `unknown` keeps the overloaded AudioNode.connect assignable; the controller only ever passes the analyser
  connect(destination: unknown): unknown;
  disconnect(): void;
};

type AudioContextLike<TStream extends AudioRecorderStreamLike> = {
  resume?(): Promise<void>;
  close(): Promise<void>;
  createMediaStreamSource(stream: TStream): AudioSourceLike;
  createAnalyser(): AnalyserLike;
};

type AudioContextConstructor<TStream extends AudioRecorderStreamLike> = new () => AudioContextLike<TStream>;

export type AudioRecorderControllerEnvironment<TStream extends AudioRecorderStreamLike = AudioRecorderStreamLike> = {
  mediaDevices?: { getUserMedia: (constraints: MediaStreamConstraints) => Promise<TStream> };
  MediaRecorder?: MediaRecorderConstructor<TStream>;
  AudioContext?: AudioContextConstructor<TStream>;
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame?: (handle: number) => void;
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
  now?: () => number;
};

type CalibrationState = {
  noiseFloor: number;
  gain: number;
  smoothedLevel: number;
};

const DEFAULT_LEVEL_COUNT = 28;
const DEFAULT_BAR_DURATION_MS = 80;
const MIN_BAR_DURATION_MS = 50;
const MIME_TYPE_CANDIDATES = ["audio/webm;codecs=opus", "audio/mp4"] as const;
const CALM_LEVEL = 0.1;
const LEVEL_COMPRESSION = 2.2;
const PEAK_BLEND = 0.35;

export function preferredAudioMimeType(MediaRecorderImpl?: { isTypeSupported?: (mimeType: string) => boolean }) {
  if (!MediaRecorderImpl?.isTypeSupported) return undefined;
  return MIME_TYPE_CANDIDATES.find((mimeType) => MediaRecorderImpl.isTypeSupported?.(mimeType));
}

const deviceIdRegex = /\(([\da-fA-F]{4}:[\da-fA-F]{4})\)$/;

// exported so device-picker UIs share one label format instead of reimplementing parsing
export function formatAudioInputDeviceLabel(device: MediaDeviceInfo, fallback = "Microphone") {
  const label = device.label.trim();
  const matches = label.match(deviceIdRegex);

  if (!matches) return label || fallback;

  const [, id] = matches;
  const name = label.replace(deviceIdRegex, "").trim();
  return `${name || fallback} (${id})`;
}

async function enumerateAudioInputDevices() {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    throw new Error("Microphone device selection is not available in this browser.");
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === "audioinput");
}

export function useAudioInputDevices(): UseAudioInputDevicesResult {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const nextDevices = await enumerateAudioInputDevices();
      setDevices(nextDevices);
      // labels only populate once mic permission granted, so presence = permission signal
      if (nextDevices.some((device) => device.label)) setHasPermission(true);
    } catch (nextError) {
      setError(asError(nextError));
    }
    setLoading(false);
  }

  async function requestPermission() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(new Error("Microphone device selection is not available in this browser."));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of stream.getTracks()) track.stop();
      setHasPermission(true);
      setDevices(await enumerateAudioInputDevices());
    } catch (nextError) {
      setError(microphoneError(nextError));
    }
    setLoading(false);
  }

  const refreshFromEffect = useEffectEvent(refresh);

  useEffect(() => {
    queueMicrotask(() => void refreshFromEffect());
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.addEventListener) return;

    const handleDeviceChange = () => {
      void refreshFromEffect();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
  }, []);

  return { devices, loading, error, hasPermission, refresh, requestPermission };
}

function browserEnvironment(): AudioRecorderControllerEnvironment<MediaStream> {
  // structural view of globalThis: Safari's prefixed webkitAudioContext is not declared in lib.dom
  const scope: { AudioContext?: AudioContextConstructor<MediaStream>; webkitAudioContext?: AudioContextConstructor<MediaStream> } =
    globalThis;

  return {
    mediaDevices: typeof navigator !== "undefined" ? navigator.mediaDevices : undefined,
    MediaRecorder: typeof MediaRecorder !== "undefined" ? MediaRecorder : undefined,
    AudioContext: typeof AudioContext !== "undefined" ? AudioContext : scope.webkitAudioContext,
    // wrapped so host fns aren't called with env object as `this` ("Illegal invocation")
    requestAnimationFrame:
      typeof requestAnimationFrame !== "undefined" ? (callback: FrameRequestCallback) => requestAnimationFrame(callback) : undefined,
    cancelAnimationFrame: typeof cancelAnimationFrame !== "undefined" ? (handle: number) => cancelAnimationFrame(handle) : undefined,
    createObjectURL: typeof URL !== "undefined" ? URL.createObjectURL?.bind(URL) : undefined,
    revokeObjectURL: typeof URL !== "undefined" ? URL.revokeObjectURL?.bind(URL) : undefined,
    now: typeof performance !== "undefined" ? () => performance.now() : () => Date.now(),
  };
}

function asError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function microphoneError(error: unknown) {
  const nextError = asError(error);

  if (nextError.name === "NotAllowedError" || nextError.name === "SecurityError") {
    return new Error("Microphone permission was denied.");
  }

  if (nextError.name === "NotFoundError" || nextError.name === "OverconstrainedError") {
    return new Error("Selected microphone is not available.");
  }

  return nextError;
}

function clampLevel(value: number) {
  return Math.min(1, Math.max(0.06, value));
}

function rmsFromSamples(samples: Uint8Array<ArrayBuffer>, start: number, end: number) {
  let total = 0;
  let count = 0;

  for (let index = start; index < end; index += 1) {
    const sample = (samples[index] - 128) / 128;
    total += sample * sample;
    count += 1;
  }

  return count === 0 ? 0 : Math.sqrt(total / count);
}

function nextAudioLevel(samples: Uint8Array<ArrayBuffer>, calibration: CalibrationState) {
  const wholeSignal = rmsFromSamples(samples, 0, samples.length);
  calibration.noiseFloor =
    wholeSignal < calibration.noiseFloor * 1.6 ? calibration.noiseFloor * 0.96 + wholeSignal * 0.04 : calibration.noiseFloor;

  const signal = Math.max(0, wholeSignal - calibration.noiseFloor);
  const targetGain = Math.min(5, Math.max(1.8, 0.36 / Math.max(signal, 0.08)));
  calibration.gain = calibration.gain * 0.88 + targetGain * 0.12;
  const compressedSignal = 1 - Math.exp(-signal * calibration.gain * LEVEL_COMPRESSION);
  const target = clampLevel(CALM_LEVEL + compressedSignal * (1 - CALM_LEVEL));
  const smoothing = target > calibration.smoothedLevel ? 0.5 : 0.14;
  calibration.smoothedLevel = clampLevel(calibration.smoothedLevel * (1 - smoothing) + target * smoothing);
  return calibration.smoothedLevel;
}

function recordingStateCanCancel(state: AudioRecorderState) {
  return state === "requesting" || state === "recording" || state === "recorded" || state === "error";
}

function audioTrackConstraints(deviceId?: string): MediaTrackConstraints {
  const constraints: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  if (deviceId) constraints.deviceId = { exact: deviceId };
  return constraints;
}

function stopMediaStream(mediaStream: AudioRecorderStreamLike) {
  for (const track of mediaStream.getTracks()) track.stop();
}

export function createAudioRecorderController<TStream extends AudioRecorderStreamLike = AudioRecorderStreamLike>(
  initialOptions: UseAudioRecorderOptions = {},
  environment?: AudioRecorderControllerEnvironment<TStream>,
) {
  // separate calls keep TStream bound to whichever environment actually runs (injected vs browser default)
  return environment
    ? createControllerForEnvironment(initialOptions, environment)
    : createControllerForEnvironment(initialOptions, browserEnvironment());
}

function createControllerForEnvironment<TStream extends AudioRecorderStreamLike>(
  initialOptions: UseAudioRecorderOptions,
  environment: AudioRecorderControllerEnvironment<TStream>,
) {
  let options = { ...initialOptions };
  let snapshot: AudioRecorderSnapshot = {
    state: "idle",
    durationMs: 0,
    levels: [],
    error: null,
  };
  const listeners = new Set<() => void>();
  let stream: TStream | null = null;
  let recorder: MediaRecorderLike | null = null;
  let chunks: BlobPart[] = [];
  let audioContext: AudioContextLike<TStream> | null = null;
  let audioSource: AudioSourceLike | null = null;
  let analyser: AnalyserLike | null = null;
  let audioSamples: Uint8Array<ArrayBuffer> | null = null;
  let animationFrame: number | null = null;
  let startedAt = 0;
  let selectedMimeType = "";
  let activeRecording: AudioRecording | undefined;
  let stopPromise: Promise<AudioRecording | null> | null = null;
  let resolveStop: ((recording: AudioRecording | null) => void) | null = null;
  let discardOnStop = false;
  let requestId = 0;
  let destroyed = false;
  let bucketStartedAt = 0;
  let bucketLevelTotal = 0;
  let bucketPeakLevel = 0;
  let bucketSampleCount = 0;
  const calibration: CalibrationState = { noiseFloor: 0.018, gain: 4, smoothedLevel: CALM_LEVEL };

  function emit() {
    for (const listener of listeners) listener();
  }

  function setSnapshot(next: Partial<AudioRecorderSnapshot>) {
    snapshot = { ...snapshot, ...next };
    emit();
  }

  function now() {
    return environment.now?.() ?? Date.now();
  }

  function resolvedBarCount() {
    return Math.max(1, Math.floor(options.barCount ?? DEFAULT_LEVEL_COUNT));
  }

  function resolvedBarDurationMs() {
    return Math.max(MIN_BAR_DURATION_MS, Math.floor(options.barDurationMs ?? DEFAULT_BAR_DURATION_MS));
  }

  function resetWaveform(startTime = now()) {
    calibration.noiseFloor = 0.018;
    calibration.gain = 4;
    calibration.smoothedLevel = CALM_LEVEL;
    bucketStartedAt = startTime;
    bucketLevelTotal = 0;
    bucketPeakLevel = 0;
    bucketSampleCount = 0;
    return [];
  }

  function clearActiveRecording() {
    if (activeRecording?.url) environment.revokeObjectURL?.(activeRecording.url);
    activeRecording = undefined;
  }

  function stopLiveInput() {
    if (animationFrame !== null) {
      environment.cancelAnimationFrame?.(animationFrame);
      animationFrame = null;
    }

    try {
      audioSource?.disconnect();
    } catch {}

    try {
      void audioContext?.close();
    } catch {}

    for (const track of stream?.getTracks() ?? []) track.stop();

    stream = null;
    audioContext = null;
    audioSource = null;
    analyser = null;
    audioSamples = null;
  }

  function releaseRecorder() {
    recorder = null;
    chunks = [];
    selectedMimeType = "";
    startedAt = 0;
  }

  function resetToIdle() {
    setSnapshot({
      state: "idle",
      durationMs: 0,
      levels: resetWaveform(),
      error: null,
      recording: undefined,
    });
  }

  function finishStop(recording: AudioRecording | null) {
    const done = resolveStop;
    resolveStop = null;
    stopPromise = null;
    done?.(recording);
  }

  function finalizeRecording() {
    const discard = discardOnStop;
    discardOnStop = false;
    stopLiveInput();

    if (discard) {
      releaseRecorder();
      resetToIdle();
      finishStop(null);
      return;
    }

    const stoppedAt = now();
    const durationMs = Math.max(snapshot.durationMs, stoppedAt - startedAt);
    const mimeType = recorder?.mimeType || selectedMimeType || "audio/webm";
    const blob = new Blob(chunks, { type: mimeType });
    clearActiveRecording();
    activeRecording = {
      blob,
      url: environment.createObjectURL?.(blob) ?? "",
      durationMs,
      mimeType: blob.type || mimeType,
    };
    releaseRecorder();
    setSnapshot({
      state: "recorded",
      durationMs,
      recording: activeRecording,
      error: null,
    });
    finishStop(activeRecording);
  }

  function scheduleFrame() {
    if (!environment.requestAnimationFrame || animationFrame !== null || snapshot.state !== "recording") return;
    animationFrame = environment.requestAnimationFrame(readFrame);
  }

  function readAudioLevel() {
    if (!analyser || !audioSamples) return CALM_LEVEL;
    analyser.getByteTimeDomainData(audioSamples);
    return nextAudioLevel(audioSamples, calibration);
  }

  function collectAudioLevel() {
    const level = readAudioLevel();
    bucketLevelTotal += level;
    bucketPeakLevel = Math.max(bucketPeakLevel, level);
    bucketSampleCount += 1;
  }

  function flushLevelBucket(timestamp: number, force = false) {
    if (bucketSampleCount === 0) return snapshot.levels;
    if (!force && timestamp - bucketStartedAt < resolvedBarDurationMs()) return snapshot.levels;

    const averageLevel = bucketLevelTotal / bucketSampleCount;
    const level = clampLevel(averageLevel + (bucketPeakLevel - averageLevel) * PEAK_BLEND);
    const levels = [...snapshot.levels, level].slice(-resolvedBarCount());
    bucketStartedAt = timestamp;
    bucketLevelTotal = 0;
    bucketPeakLevel = 0;
    bucketSampleCount = 0;
    return levels;
  }

  function readFrame() {
    animationFrame = null;
    if (snapshot.state !== "recording") return;

    const timestamp = now();
    collectAudioLevel();
    const levels = flushLevelBucket(timestamp);
    const durationMs = Math.max(0, timestamp - startedAt);
    setSnapshot({ durationMs, levels });

    if (options.maxDurationMs && durationMs >= options.maxDurationMs) {
      void stop();
      return;
    }

    scheduleFrame();
  }

  function attachAnalyser(nextStream: TStream) {
    if (!environment.AudioContext) return;

    try {
      audioContext = new environment.AudioContext();
      const resume = audioContext.resume?.();
      void resume?.catch(() => {});
      audioSource = audioContext.createMediaStreamSource(nextStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.18;
      audioSamples = new Uint8Array(analyser.fftSize);
      audioSource.connect(analyser);
    } catch {
      audioContext = null;
      audioSource = null;
      analyser = null;
      audioSamples = null;
    }
  }

  function discardStaleStream(nextStream: TStream, currentRequest: number) {
    if (!destroyed && currentRequest === requestId) return false;

    stopMediaStream(nextStream);
    if (currentRequest === requestId) resetToIdle();
    return true;
  }

  function beginRecording(nextStream: TStream) {
    const MediaRecorderImpl = environment.MediaRecorder;
    if (!MediaRecorderImpl) throw new Error("Microphone recording is not available in this browser.");

    selectedMimeType = preferredAudioMimeType(MediaRecorderImpl) ?? "";
    const nextRecorder = new MediaRecorderImpl(nextStream, selectedMimeType ? { mimeType: selectedMimeType } : undefined);

    chunks = [];
    nextRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    nextRecorder.onstop = finalizeRecording;

    stream = nextStream;
    recorder = nextRecorder;
    attachAnalyser(nextStream);
    startedAt = now();
    resetWaveform(startedAt);
    nextRecorder.start(Math.min(1000, Math.max(250, resolvedBarDurationMs())));
    setSnapshot({ state: "recording", durationMs: 0, levels: [], error: null });
    scheduleFrame();
  }

  async function start() {
    if (options.disabled || snapshot.state === "requesting" || snapshot.state === "recording") return false;

    clearActiveRecording();
    requestId += 1;
    const currentRequest = requestId;
    setSnapshot({
      state: "requesting",
      durationMs: 0,
      levels: resetWaveform(),
      error: null,
      recording: undefined,
    });

    if (!environment.mediaDevices?.getUserMedia || !environment.MediaRecorder) {
      setSnapshot({
        state: "error",
        error: new Error("Microphone recording is not available in this browser."),
      });
      return false;
    }

    try {
      const nextStream = await environment.mediaDevices.getUserMedia({
        audio: audioTrackConstraints(options.deviceId),
      });

      if (discardStaleStream(nextStream, currentRequest)) return false;
      beginRecording(nextStream);
      return true;
    } catch (error) {
      stopLiveInput();
      releaseRecorder();
      setSnapshot({ state: "error", error: microphoneError(error), recording: undefined });
      return false;
    }
  }

  function stop() {
    if (snapshot.state === "recorded") return Promise.resolve(snapshot.recording ?? null);
    if (!recorder || recorder.state === "inactive") return Promise.resolve(null);
    if (stopPromise) return stopPromise;

    if (snapshot.state === "recording") {
      const stoppedAt = now();
      collectAudioLevel();
      setSnapshot({
        durationMs: Math.max(snapshot.durationMs, stoppedAt - startedAt),
        levels: flushLevelBucket(stoppedAt, true),
      });
    }

    discardOnStop = false;
    stopPromise = new Promise<AudioRecording | null>((resolve) => {
      resolveStop = resolve;
      recorder?.stop();
    });
    return stopPromise;
  }

  function cancelInternal(notify: boolean) {
    const shouldNotify = notify && recordingStateCanCancel(snapshot.state);
    requestId += 1;
    clearActiveRecording();

    if (recorder && recorder.state !== "inactive") {
      discardOnStop = true;
      if (!stopPromise) {
        stopPromise = new Promise<AudioRecording | null>((resolve) => {
          resolveStop = resolve;
        });
      }
      stopLiveInput();
      recorder.stop();
    } else {
      stopLiveInput();
      releaseRecorder();
      resetToIdle();
    }

    if (shouldNotify) options.onCancel?.();
  }

  function cancel() {
    cancelInternal(true);
  }

  async function submit() {
    if (snapshot.state === "recording") {
      const recording = await stop();
      return recording ? submitRecording(recording) : null;
    }

    const recording = snapshot.recording;
    if (snapshot.state !== "recorded" || !recording) return null;

    return submitRecording(recording);
  }

  async function submitRecording(recording: AudioRecording) {
    setSnapshot({ state: "submitting", error: null });
    try {
      await options.onRecordingComplete?.(recording);
      setSnapshot({
        state: "idle",
        durationMs: 0,
        levels: resetWaveform(),
        error: null,
        recording: undefined,
      });
      return recording;
    } catch (error) {
      setSnapshot({ state: "recorded", error: asError(error), recording });
      return null;
    }
  }

  function destroy() {
    destroyed = true;
    cancelInternal(false);
    clearActiveRecording();
    listeners.clear();
  }

  function setOptions(nextOptions: UseAudioRecorderOptions) {
    const nextBarCount = nextOptions.barCount ?? DEFAULT_LEVEL_COUNT;
    const currentBarCount = options.barCount ?? DEFAULT_LEVEL_COUNT;
    options = { ...nextOptions };

    if (nextBarCount !== currentBarCount && snapshot.state === "idle") {
      setSnapshot({ levels: resetWaveform() });
    }

    if (options.disabled && (snapshot.state === "requesting" || snapshot.state === "recording")) {
      cancelInternal(false);
    }
  }

  function getResult(): UseAudioRecorderResult {
    const isDisabled = Boolean(options.disabled);

    return {
      ...snapshot,
      isDisabled,
      canStart: !isDisabled && (snapshot.state === "idle" || snapshot.state === "error"),
      canCancel: recordingStateCanCancel(snapshot.state),
      canSubmit: snapshot.state === "recording" || snapshot.state === "recorded",
      start,
      stop,
      cancel,
      submit,
    };
  }

  return {
    getSnapshot: () => snapshot,
    getResult,
    setOptions,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    isDestroyed: () => destroyed,
    start,
    stop,
    cancel,
    submit,
    destroy,
  };
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderResult {
  const [controller] = useState(() => createAudioRecorderController(options));
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const activeMount = useRef<symbol | null>(null);
  const { onRecordingComplete, onCancel, maxDurationMs, disabled, barCount, barDurationMs, deviceId } = options;

  useEffect(() => {
    const mount = Symbol("audio-recorder-mount");
    activeMount.current = mount;
    return () => {
      queueMicrotask(() => {
        if (activeMount.current === mount) controller.destroy();
      });
    };
  }, [controller]);

  useEffect(() => {
    controller.setOptions({ onRecordingComplete, onCancel, maxDurationMs, disabled, barCount, barDurationMs, deviceId });
  }, [controller, onRecordingComplete, onCancel, maxDurationMs, disabled, barCount, barDurationMs, deviceId]);

  const isDisabled = Boolean(disabled);

  return {
    ...snapshot,
    isDisabled,
    canStart: !isDisabled && (snapshot.state === "idle" || snapshot.state === "error"),
    canCancel: recordingStateCanCancel(snapshot.state),
    canSubmit: snapshot.state === "recording" || snapshot.state === "recorded",
    start: controller.start,
    stop: controller.stop,
    cancel: controller.cancel,
    submit: controller.submit,
  };
}
