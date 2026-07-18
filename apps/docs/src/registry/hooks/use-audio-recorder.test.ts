import { describe, expect, test } from "bun:test";
import type { AudioRecorderControllerEnvironment, AudioRecorderStreamLike, AudioRecording } from "./use-audio-recorder";
import { createAudioRecorderController, preferredAudioMimeType } from "./use-audio-recorder";

class MockTrack {
  stopped = false;

  stop() {
    this.stopped = true;
  }
}

class MockStream {
  constructor(readonly track = new MockTrack()) {}

  getTracks() {
    return [this.track];
  }
}

class MockAnalyser {
  fftSize = 8;
  smoothingTimeConstant = 0;
  amplitude = 0;

  getByteTimeDomainData(samples: Uint8Array) {
    for (let index = 0; index < samples.length; index += 1) {
      const value = 128 + (index % 2 === 0 ? this.amplitude : -this.amplitude);
      samples[index] = Math.min(255, Math.max(0, value));
    }
  }
}

class MockAudioSource {
  disconnected = false;

  connect() {}

  disconnect() {
    this.disconnected = true;
  }
}

class MockAudioContext {
  closed = false;
  source = new MockAudioSource();
  analyser = new MockAnalyser();

  createMediaStreamSource() {
    return this.source;
  }

  createAnalyser() {
    return this.analyser;
  }

  close() {
    this.closed = true;
    return Promise.resolve();
  }

  resume() {
    return Promise.resolve();
  }
}

class MockMediaRecorder {
  static isTypeSupported(mimeType: string) {
    return mimeType === "audio/webm;codecs=opus";
  }

  state: RecordingState = "inactive";
  mimeType: string;
  timeslice: number | undefined;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: ((event: Event) => void) | null = null;

  constructor(_stream: AudioRecorderStreamLike, options?: MediaRecorderOptions) {
    this.mimeType = options?.mimeType ?? "audio/webm";
  }

  start(timeslice?: number) {
    this.state = "recording";
    this.timeslice = timeslice;
  }

  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["voice"], { type: this.mimeType }) });
    this.onstop?.(new Event("stop"));
  }
}

function environment(stream = new MockStream(), overrides: Partial<AudioRecorderControllerEnvironment> = {}) {
  let mediaRequests = 0;
  let lastConstraints: MediaStreamConstraints | undefined;
  let canceledFrame: number | null = null;
  let objectUrlRevoked: string | null = null;
  let currentNow = 1000;
  let frameCallback: FrameRequestCallback | null = null;
  let audioContext: MockAudioContext | null = null;
  const TestAudioContext = class extends MockAudioContext {
    constructor() {
      super();
      audioContext = this;
    }
  };
  const env = {
    mediaDevices: {
      async getUserMedia(constraints?: MediaStreamConstraints) {
        mediaRequests += 1;
        lastConstraints = constraints;
        return stream;
      },
    },
    MediaRecorder: MockMediaRecorder,
    AudioContext: TestAudioContext,
    requestAnimationFrame(callback: FrameRequestCallback) {
      frameCallback = callback;
      return 42;
    },
    cancelAnimationFrame(handle: number) {
      canceledFrame = handle;
    },
    createObjectURL() {
      return "blob:voice";
    },
    revokeObjectURL(url: string) {
      objectUrlRevoked = url;
    },
    now() {
      return currentNow;
    },
    ...overrides,
  } satisfies AudioRecorderControllerEnvironment;

  return {
    env,
    stream,
    get mediaRequests() {
      return mediaRequests;
    },
    get lastConstraints() {
      return lastConstraints;
    },
    get audioContext() {
      return audioContext;
    },
    get canceledFrame() {
      return canceledFrame;
    },
    get objectUrlRevoked() {
      return objectUrlRevoked;
    },
    setNow(value: number) {
      currentNow = value;
    },
    runFrame() {
      const callback = frameCallback;
      frameCallback = null;
      callback?.(currentNow);
    },
  };
}

describe("useAudioRecorder controller", () => {
  test("starts recording only after start", async () => {
    const setup = environment();
    const controller = createAudioRecorderController({}, setup.env);

    expect(setup.mediaRequests).toBe(0);
    expect(controller.getSnapshot().state).toBe("idle");

    await controller.start();

    expect(setup.mediaRequests).toBe(1);
    expect(controller.getSnapshot().state).toBe("recording");
  });

  test("handles missing microphone APIs with an error state", async () => {
    const controller = createAudioRecorderController({}, { now: () => 0 });

    await expect(controller.start()).resolves.toBe(false);
    expect(controller.getSnapshot().state).toBe("error");
    expect(controller.getSnapshot().error?.message).toContain("Microphone recording is not available");
  });

  test("handles denied microphone permission with a usable error state", async () => {
    const denied = Object.assign(new Error("Permission dismissed"), { name: "NotAllowedError" });
    const setup = environment(new MockStream(), {
      mediaDevices: {
        async getUserMedia() {
          throw denied;
        },
      },
    });
    const controller = createAudioRecorderController({}, setup.env);

    await expect(controller.start()).resolves.toBe(false);
    expect(controller.getSnapshot().state).toBe("error");
    expect(controller.getSnapshot().error?.message).toBe("Microphone permission was denied.");
  });

  test("requests the selected microphone when a device id is provided", async () => {
    const setup = environment();
    const controller = createAudioRecorderController({ deviceId: "mic-2" }, setup.env);

    await controller.start();

    expect(setup.lastConstraints?.audio).toEqual({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      deviceId: { exact: "mic-2" },
    });
  });

  test("stops tracks and animation frames on cancel", async () => {
    const track = new MockTrack();
    const setup = environment(new MockStream(track));
    const controller = createAudioRecorderController({}, setup.env);

    await controller.start();
    controller.cancel();

    expect(track.stopped).toBe(true);
    expect(setup.canceledFrame).toBe(42);
    expect(controller.getSnapshot().state).toBe("idle");
  });

  test("stops tracks and animation frames on destroy", async () => {
    const track = new MockTrack();
    const setup = environment(new MockStream(track));
    const controller = createAudioRecorderController({}, setup.env);

    await controller.start();
    controller.destroy();

    expect(track.stopped).toBe(true);
    expect(setup.canceledFrame).toBe(42);
  });

  test("reports destruction so consumers can replace a dead controller", () => {
    const setup = environment();
    const controller = createAudioRecorderController({}, setup.env);

    expect(controller.isDestroyed()).toBe(false);
    controller.destroy();
    expect(controller.isDestroyed()).toBe(true);
  });

  test("start after destroy releases the granted stream and settles back to idle", async () => {
    const track = new MockTrack();
    const setup = environment(new MockStream(track));
    const controller = createAudioRecorderController({}, setup.env);

    controller.destroy();
    await expect(controller.start()).resolves.toBe(false);

    expect(track.stopped).toBe(true);
    expect(controller.getSnapshot().state).toBe("idle");
  });

  test("cancel during the permission request discards the granted stream", async () => {
    const track = new MockTrack();
    const stream = new MockStream(track);
    const setup = environment(stream, {
      mediaDevices: {
        getUserMedia: () =>
          new Promise((resolve) => {
            queueMicrotask(() => resolve(stream));
          }),
      },
    });
    const controller = createAudioRecorderController({}, setup.env);

    const startPromise = controller.start();
    expect(controller.getSnapshot().state).toBe("requesting");
    controller.cancel();

    await expect(startPromise).resolves.toBe(false);
    expect(track.stopped).toBe(true);
    expect(controller.getSnapshot().state).toBe("idle");
  });

  test("default browser environment calls host animation frames without an illegal `this`", async () => {
    const globalKeys = ["requestAnimationFrame", "cancelAnimationFrame", "MediaRecorder", "AudioContext", "navigator"] as const;
    const originals = new Map(globalKeys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    const frameThisValues: unknown[] = [];
    const stream = new MockStream();

    const defineGlobal = (key: string, value: unknown) => {
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    };

    try {
      // browsers throw "Illegal invocation" if rAF runs with `this` !== window; mirror that check
      defineGlobal("requestAnimationFrame", function (this: unknown, callback: FrameRequestCallback) {
        frameThisValues.push(this);
        if (this !== undefined && this !== globalThis) throw new TypeError("Illegal invocation");
        void callback;
        return 7;
      });
      defineGlobal("cancelAnimationFrame", function (this: unknown) {
        if (this !== undefined && this !== globalThis) throw new TypeError("Illegal invocation");
      });
      defineGlobal("MediaRecorder", MockMediaRecorder);
      defineGlobal("AudioContext", MockAudioContext);
      defineGlobal("navigator", { mediaDevices: { getUserMedia: async () => stream } });

      const controller = createAudioRecorderController();
      await controller.start();

      expect(controller.getSnapshot().state).toBe("recording");
      expect(controller.getSnapshot().error).toBeNull();
      expect(frameThisValues.length).toBeGreaterThan(0);
      controller.destroy();
    } finally {
      for (const key of globalKeys) {
        const descriptor = originals.get(key);
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    }
  });

  test("submits a Blob with duration and MIME type", async () => {
    const completed: { current: AudioRecording | null } = { current: null };
    const setup = environment();
    const controller = createAudioRecorderController(
      {
        onRecordingComplete(completedRecording) {
          completed.current = completedRecording;
        },
      },
      setup.env,
    );

    expect(preferredAudioMimeType(MockMediaRecorder)).toBe("audio/webm;codecs=opus");

    await controller.start();
    setup.setNow(2450);
    const recording = await controller.stop();
    await controller.submit();

    expect(recording?.blob).toBeInstanceOf(Blob);
    expect(completed.current?.blob).toBeInstanceOf(Blob);
    expect(completed.current?.durationMs).toBe(1450);
    expect(completed.current?.mimeType).toBe("audio/webm;codecs=opus");

    controller.destroy();
    expect(setup.objectUrlRevoked).toBe("blob:voice");
  });

  test("submits directly from the recording state", async () => {
    const completed: { current: AudioRecording | null } = { current: null };
    const setup = environment();
    const controller = createAudioRecorderController(
      {
        onRecordingComplete(completedRecording) {
          completed.current = completedRecording;
        },
      },
      setup.env,
    );

    await controller.start();
    setup.setNow(2450);
    const recording = await controller.submit();

    expect(recording?.blob).toBeInstanceOf(Blob);
    expect(completed.current?.blob).toBeInstanceOf(Blob);
    expect(completed.current?.durationMs).toBe(1450);
    expect(controller.getSnapshot().state).toBe("idle");
  });

  test("updates the default waveform window at the preview's 80ms cadence", async () => {
    const setup = environment();
    const controller = createAudioRecorderController({}, setup.env);

    await controller.start();
    const audioContext = setup.audioContext;
    if (!audioContext) throw new Error("expected the recorder to create an audio context");

    audioContext.analyser.amplitude = 24;
    setup.setNow(1079);
    setup.runFrame();
    expect(controller.getSnapshot().levels).toHaveLength(0);

    setup.setNow(1080);
    setup.runFrame();
    expect(controller.getSnapshot().levels).toHaveLength(1);
  });

  test("preserves short microphone peaks without exceeding the normalized range", async () => {
    const transientSetup = environment();
    const transientController = createAudioRecorderController({}, transientSetup.env);
    await transientController.start();
    const transientContext = transientSetup.audioContext;
    if (!transientContext) throw new Error("expected the recorder to create an audio context");

    transientContext.analyser.amplitude = 4;
    transientSetup.setNow(1040);
    transientSetup.runFrame();
    transientContext.analyser.amplitude = 96;
    transientSetup.setNow(1080);
    transientSetup.runFrame();

    const steadySetup = environment();
    const steadyController = createAudioRecorderController({}, steadySetup.env);
    await steadyController.start();
    const steadyContext = steadySetup.audioContext;
    if (!steadyContext) throw new Error("expected the recorder to create an audio context");

    steadyContext.analyser.amplitude = 4;
    steadySetup.setNow(1040);
    steadySetup.runFrame();
    steadySetup.setNow(1080);
    steadySetup.runFrame();

    const transientLevel = transientController.getSnapshot().levels[0];
    const steadyLevel = steadyController.getSnapshot().levels[0];
    expect(transientLevel).toBeGreaterThan(steadyLevel);
    expect(transientLevel).toBeLessThan(1);
    expect(steadyLevel).toBeGreaterThanOrEqual(0.06);
  });

  test("keeps quiet, typical, and loud microphones visually distinct", async () => {
    async function levelForAmplitude(amplitude: number) {
      const setup = environment();
      const controller = createAudioRecorderController({}, setup.env);
      await controller.start();
      const audioContext = setup.audioContext;
      if (!audioContext) throw new Error("expected the recorder to create an audio context");

      audioContext.analyser.amplitude = amplitude;
      setup.setNow(1040);
      setup.runFrame();
      setup.setNow(1080);
      setup.runFrame();
      return controller.getSnapshot().levels[0];
    }

    const quiet = await levelForAmplitude(4);
    const typical = await levelForAmplitude(24);
    const loud = await levelForAmplitude(96);

    expect(quiet).toBeLessThan(typical);
    expect(typical).toBeLessThan(loud);
    expect(loud).toBeLessThan(1);
  });

  test("appends one peak-aware waveform bar per configured duration bucket", async () => {
    const setup = environment();
    const controller = createAudioRecorderController({ barCount: 3, barDurationMs: 200 }, setup.env);

    await controller.start();
    expect(controller.getSnapshot().levels).toHaveLength(0);
    const audioContext = setup.audioContext;
    if (!audioContext) throw new Error("expected the recorder to create an audio context");

    audioContext.analyser.amplitude = 24;
    setup.setNow(1090);
    setup.runFrame();
    expect(controller.getSnapshot().levels).toHaveLength(0);

    setup.setNow(1210);
    setup.runFrame();
    const firstBucket = controller.getSnapshot().levels;
    expect(firstBucket).toHaveLength(1);

    audioContext.analyser.amplitude = 64;
    setup.setNow(1420);
    setup.runFrame();
    const secondBucket = controller.getSnapshot().levels;
    expect(secondBucket).toHaveLength(2);
    expect(secondBucket[1]).toBeGreaterThan(firstBucket[0]);

    setup.setNow(1630);
    setup.runFrame();
    setup.setNow(1840);
    setup.runFrame();
    expect(controller.getSnapshot().levels).toHaveLength(3);
  });
});
