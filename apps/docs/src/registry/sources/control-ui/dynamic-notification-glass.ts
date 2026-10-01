import {
  createNotificationCanvasLoop,
  createNotificationMotion,
  type NotificationCanvasFrame,
} from "@/components/control-ui/dynamic-notification-canvas-loop";
import { DYNAMIC_NOTIFICATION_SIRI_WAVE_GLSL } from "@/components/control-ui/dynamic-notification-siri-wave";

// CSS paints gradient fallback under canvas, so absent or lost WebGL degrades to static material instead of hole.
export type DynamicNotificationGlassOptions = {
  /** Aurora strength 0..1 (default 1). */
  intensity?: number;
  /** devicePixelRatio clamp (default 2) — island is small, 2x is visually lossless. */
  maxDpr?: number;
};

const VERTEX_SHADER = /* glsl */ `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_radius;
uniform float u_intensity;
uniform float u_aurora;
uniform float u_reveal;
uniform float u_settle;
uniform float u_lift;
uniform float u_ribbonHorizon;

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float ridge(float y, float center, float sharpness) {
  float delta = (y - center) * sharpness;
  return exp(-delta * delta);
}

${DYNAMIC_NOTIFICATION_SIRI_WAVE_GLSL}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = gl_FragCoord.xy - 0.5 * u_resolution;
  vec2 halfSize = 0.5 * u_resolution;
  float radius = min(u_radius, min(halfSize.x, halfSize.y));
  float d = sdRoundBox(p, halfSize, radius);
  float shape = 1.0 - smoothstep(-1.5, 0.5, d);
  if (shape <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  /* gradient itself morphs, so pill never pops from opaque to translucent; expanded keeps a 0.4 floor for reply controls */
  float gradThinking = mix(0.10, 0.97, smoothstep(u_ribbonHorizon - 0.10, u_ribbonHorizon + 0.10, uv.y));
  float gradExpanded = mix(0.40, 0.97, smoothstep(0.00, 0.30, uv.y));
  float grad = mix(gradThinking, gradExpanded, u_settle);
  float alpha = mix(0.97, grad, u_reveal);
  vec3 color = vec3(0.004, 0.004, 0.006) * mix(1.0, 0.4 + 0.6 * uv.y, u_reveal);

  /* pale rainbow band across horizon */
  float sheenY = u_ribbonHorizon + 0.02 * sin(u_time * 0.35);
  float sheen = ridge(uv.y, sheenY, 9.0);
  float spread = smoothstep(0.06, 0.4, uv.x) * smoothstep(0.94, 0.6, uv.x);
  color += spread * 0.085 * vec3(
    sheen * (0.9 + 0.35 * sin(uv.x * 8.0 + 1.6)),
    ridge(uv.y, sheenY + 0.015, 9.5),
    ridge(uv.y, sheenY - 0.02, 8.5) * 1.15
  );

  vec3 aurora = dynamicNotificationSiriWave(uv, u_resolution, u_time, u_ribbonHorizon, u_lift)
    * u_intensity * u_aurora * (1.0 - u_lift);
  float glow = max(aurora.r, max(aurora.g, aurora.b));
  alpha = min(1.0, alpha + glow * 0.5);

  /* inner rim light — glass thickness catching environment */
  float rim = exp(-pow((d + 1.75) * 0.30, 2.0));
  color += rim * vec3(0.82, 0.88, 1.0) * (0.05 + 0.10 * (1.0 - uv.y));

  /* edge refraction stays narrow and mostly opaque on purpose: wide translucent band under backdrop blur reads as background melting into edge, not as glass */
  float bevelW = max(4.0, u_radius * 0.32);
  float bt = clamp(1.0 + d / bevelW, 0.0, 1.0);
  float bevel = pow(bt, 2.4);
  alpha *= 1.0 - 0.30 * bevel;
  float seam = exp(-pow((bt - 0.42) * 7.0, 2.0));
  color *= 1.0 - 0.25 * seam;
  color += vec3(0.95, 0.97, 1.0) * bevel * bevel * (0.35 + 0.65 * uv.y) * 0.18;

  /* dither so long dark gradient never bands */
  color += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

  alpha *= shape;
  gl_FragColor = vec4(color * alpha + aurora * shape, alpha);
}
`;

type GlassProgram = {
  program: WebGLProgram;
  buffer: WebGLBuffer;
  resolution: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  radius: WebGLUniformLocation | null;
  intensity: WebGLUniformLocation | null;
  aurora: WebGLUniformLocation | null;
  reveal: WebGLUniformLocation | null;
  settle: WebGLUniformLocation | null;
  lift: WebGLUniformLocation | null;
  ribbonHorizon: WebGLUniformLocation | null;
};

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function buildProgram(gl: WebGLRenderingContext): GlassProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!program || !buffer) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  return {
    program,
    buffer,
    resolution: gl.getUniformLocation(program, "u_resolution"),
    time: gl.getUniformLocation(program, "u_time"),
    radius: gl.getUniformLocation(program, "u_radius"),
    intensity: gl.getUniformLocation(program, "u_intensity"),
    aurora: gl.getUniformLocation(program, "u_aurora"),
    reveal: gl.getUniformLocation(program, "u_reveal"),
    settle: gl.getUniformLocation(program, "u_settle"),
    lift: gl.getUniformLocation(program, "u_lift"),
    ribbonHorizon: gl.getUniformLocation(program, "u_ribbonHorizon"),
  };
}

export function createDynamicNotificationGlass(canvas: HTMLCanvasElement, options: DynamicNotificationGlassOptions = {}): () => void {
  const { intensity = 1, maxDpr = 2 } = options;
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return () => {};

  // remount on same canvas hands back SAME live context, so cleanup must never loseContext():
  // lost context returns null from getExtension, leaving no later instance able to restore it.
  let contextLost = gl.isContextLost();
  let glass = contextLost ? null : buildProgram(gl);
  if (!contextLost && !glass) return () => {};

  let dpr = 1;
  const motion = createNotificationMotion(canvas.parentElement?.dataset.state);
  const startedAt = performance.now();

  /* Called from render(), never an observer: setting canvas.width clears the buffer, and rAF ticks run
     before ResizeObserver callbacks, so an observer-side resize would wipe the drawn pixels before paint. */
  function resize(): void {
    // layout box, immune to the @starting-style scale at mount — getBoundingClientRect would bake that transform into backing size
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function render({ reduced, now, deltaMs }: NotificationCanvasFrame): boolean {
    const host = canvas.parentElement;
    if (!gl || !glass || contextLost || !host) return false;
    resize();
    const hostRadius = Number.parseFloat(getComputedStyle(host).borderTopLeftRadius);
    const keepAnimating = motion.advance(host.dataset.state, Number.isFinite(hostRadius) ? hostRadius * dpr : 0, reduced, deltaMs);
    const { radius, aurora, reveal, settle, lift } = motion.values;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook.
    gl.useProgram(glass.program);
    gl.uniform2f(glass.resolution, canvas.width, canvas.height);
    gl.uniform1f(glass.time, reduced ? 4.2 : (now - startedAt) / 1000);
    gl.uniform1f(glass.radius, radius);
    gl.uniform1f(glass.intensity, intensity);
    gl.uniform1f(glass.aurora, aurora);
    gl.uniform1f(glass.reveal, reveal);
    gl.uniform1f(glass.settle, settle);
    gl.uniform1f(glass.lift, lift);
    gl.uniform1f(glass.ribbonHorizon, 0.5);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (canvas.dataset.glassReady !== "true") canvas.dataset.glassReady = "true";
    return keepAnimating;
  }

  const loop = createNotificationCanvasLoop(canvas, render);

  function handleContextLost(event: Event): void {
    // preventDefault asks for context back — browser then fires webglcontextrestored
    event.preventDefault();
    contextLost = true;
    loop.cancel();
  }

  function handleContextRestored(): void {
    // hoisted, so outer guard's narrowing does not flow in
    if (!gl) return;
    contextLost = false;
    glass = buildProgram(gl);
    loop.invalidate();
  }

  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);

  loop.invalidate();

  return () => {
    loop.destroy();
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    delete canvas.dataset.glassReady;
    if (glass && !gl.isContextLost()) {
      gl.deleteProgram(glass.program);
      gl.deleteBuffer(glass.buffer);
    }
    glass = null;
  };
}
