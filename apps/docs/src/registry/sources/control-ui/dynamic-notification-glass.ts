import { DYNAMIC_NOTIFICATION_SIRI_WAVE_GLSL } from "@/components/control-ui/dynamic-notification-siri-wave";

/*
 * Liquid-glass WebGL material for DynamicNotification's "glass" variant (Siri-style island).
 * Vanilla engine (no React): the component hands it one <canvas>, it returns a single cleanup fn —
 * same split as extensions/create-track-highlight.ts. CSS keeps a gradient fallback under the canvas,
 * so no WebGL (or a lost context) degrades to the static material instead of a hole.
 * Paints: black→glass vertical gradient, top sheen with slight spectral dispersion, a chromatic
 * Siri waveform across the horizon, and an inner rim light — all inside a
 * rounded-rect SDF matching the island's current border-radius (re-read per frame so the
 * pill→bubble morph stays in sync).
 * Reduced motion (OS media query or data-motion="reduced"): renders exactly one static frame,
 * re-rendering only on geometry changes — never a running RAF loop.
 */

export type DynamicNotificationGlassOptions = {
  /** Aurora strength 0..1 (default 1). */
  intensity?: number;
  /** devicePixelRatio clamp (default 2) — the island is small, 2x is visually lossless. */
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

  /* 1. ink profile: a SOLID black face while collapsed that dissolves into the REAL
     black -> 10% black gradient as u_reveal eases toward 1 (thinking + expanded) — the
     gradient itself morphs, so the pill never pops from opaque to translucent */
  /* Two plateau curves, blended by u_settle so the bubble's ink thickens on the same spring that
     opens it. The thinking fade is centred on the ribbon horizon; expanded keeps a 0.4 floor for
     the reply controls in its bottom third. */
  float gradThinking = mix(0.10, 0.97, smoothstep(u_ribbonHorizon - 0.10, u_ribbonHorizon + 0.10, uv.y));
  float gradExpanded = mix(0.40, 0.97, smoothstep(0.00, 0.30, uv.y));
  float grad = mix(gradThinking, gradExpanded, u_settle);
  float alpha = mix(0.97, grad, u_reveal);
  vec3 color = vec3(0.004, 0.004, 0.006) * mix(1.0, 0.4 + 0.6 * uv.y, u_reveal);

  /* 2. sheen horizon with subtle spectral dispersion (the pale rainbow band on the real island) */
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

  /* 3. inner rim light — glass thickness catching the environment */
  float rim = exp(-pow((d + 1.75) * 0.30, 2.0));
  color += rim * vec3(0.82, 0.88, 1.0) * (0.05 + 0.10 * (1.0 - uv.y));

  /* 4. edge refraction of the glass container itself: a THIN ring where the ink barely thins
     so a hint of the CSS-blurred backdrop shows through, with a dark seam just inside and a
     bright pull at the top. Kept narrow and mostly opaque on purpose: a wide translucent band
     under the backdrop blur reads as the background melting into the edge, not as glass. */
  float bevelW = max(4.0, u_radius * 0.32);
  float bt = clamp(1.0 + d / bevelW, 0.0, 1.0);
  float bevel = pow(bt, 2.4);
  alpha *= 1.0 - 0.30 * bevel;
  float seam = exp(-pow((bt - 0.42) * 7.0, 2.0));
  color *= 1.0 - 0.25 * seam;
  color += vec3(0.95, 0.97, 1.0) * bevel * bevel * (0.35 + 0.65 * uv.y) * 0.18;

  /* dither so the long dark gradient never bands */
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

/* aurora shows ONLY while the model is thinking; the static pill and the opened chat stay clean */
function auroraTarget(state: string | undefined): number {
  return state === "thinking" ? 1 : 0;
}

/* gradient reveal: only the collapsed pill is solid black; the thinking blob and the expanded
   bubble both show the black -> transparent fade */
function revealTarget(state: string | undefined): number {
  return state === "collapsed" ? 0 : 1;
}

/* which of the two ink ramps the fade lands on: the thinking blob runs out to transparent, the
   expanded bubble keeps a floor so its reply controls have something to sit on */
function settleTarget(state: string | undefined): number {
  return state === "expanded" ? 1 : 0;
}

export function createDynamicNotificationGlass(canvas: HTMLCanvasElement, options: DynamicNotificationGlassOptions = {}): () => void {
  const { intensity = 1, maxDpr = 2 } = options;
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return () => {};

  // Remount on the same canvas (StrictMode double-effect, fast skin swaps) hands back the SAME
  // live context — which is why cleanup only deletes program+buffer and NEVER loseContext():
  // a lose()d context can't hand out WEBGL_lose_context anymore (getExtension returns null when
  // lost), so no later instance could ever restore it. The context's real lifetime is the canvas's.
  let contextLost = gl.isContextLost();
  let glass = contextLost ? null : buildProgram(gl);
  if (!contextLost && !glass) return () => {};

  let destroyed = false;
  let intersecting = true;
  let pageVisible = !document.hidden;
  let rafId = 0;
  let dpr = 1;
  /* radius eases toward the island's live border-radius so the shader rim follows the pill→bubble morph */
  let radius = 0;
  /* aurora energy eases toward the island's data-state target (thinking pulses, expanded settles) */
  let aurora = auroraTarget(canvas.parentElement?.dataset.state);
  /* lift sends the dying sheet toward the top on exit; parked high whenever the aurora is off */
  let lift = 1 - aurora;
  let reveal = revealTarget(canvas.parentElement?.dataset.state);
  let settle = settleTarget(canvas.parentElement?.dataset.state);
  let staticFrameDrawn = false;
  const startedAt = performance.now();
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function reducedMotion(): boolean {
    return reducedMotionQuery.matches || canvas.closest('[data-motion="reduced"]') !== null;
  }

  function targetRadius(): number {
    const host = canvas.parentElement;
    if (!host) return 0;
    const parsed = Number.parseFloat(getComputedStyle(host).borderTopLeftRadius);
    return Number.isFinite(parsed) ? parsed * dpr : 0;
  }

  function targetRibbonHorizon(): number {
    const host = canvas.parentElement;
    if (!host) return 0.5;
    const parsed = Number.parseFloat(getComputedStyle(host).getPropertyValue("--dn-ribbon-horizon"));
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed / 100)) : 0.5;
  }

  /* Runs at the TOP of every draw, never from observers: setting canvas.width clears the buffer,
     so resize and repaint must share one task or the compositor shows a blank frame (flicker —
     rAF ticks run BEFORE ResizeObserver callbacks within a frame, so an observer-side resize
     wiped the freshly drawn pixels right before paint on every morph frame). */
  function resize(): void {
    // clientWidth/Height: layout box, immune to the @starting-style scale running at mount
    // (getBoundingClientRect would bake the mid-animation transform into the backing size).
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function advanceMotion(reduced: boolean): void {
    const target = targetRadius();
    radius = reduced ? target : radius + (target - radius) * 0.25;

    const auroraGoal = auroraTarget(canvas.parentElement?.dataset.state);
    aurora = reduced ? auroraGoal : aurora + (auroraGoal - aurora) * 0.06;
    /* Keep exit linear so the sheet clears the surface before the opening morph collapses. */
    const liftGoal = auroraGoal >= 0.5 ? 0 : 1;
    if (reduced) lift = liftGoal;
    else if (liftGoal === 1) lift = Math.min(1, lift + 0.036);
    else lift *= 0.72;

    const revealGoal = revealTarget(canvas.parentElement?.dataset.state);
    reveal = reduced ? revealGoal : reveal + (revealGoal - reveal) * 0.07;
    const settleGoal = settleTarget(canvas.parentElement?.dataset.state);
    settle = reduced ? settleGoal : settle + (settleGoal - settle) * 0.07;
  }

  function uploadUniforms(activeGl: WebGLRenderingContext, activeGlass: GlassProgram, reduced: boolean): void {
    activeGl.uniform2f(activeGlass.resolution, canvas.width, canvas.height);
    activeGl.uniform1f(activeGlass.time, reduced ? 4.2 : (performance.now() - startedAt) / 1000);
    activeGl.uniform1f(activeGlass.radius, radius);
    activeGl.uniform1f(activeGlass.intensity, intensity);
    activeGl.uniform1f(activeGlass.aurora, aurora);
    activeGl.uniform1f(activeGlass.reveal, reveal);
    activeGl.uniform1f(activeGlass.settle, settle);
    activeGl.uniform1f(activeGlass.lift, lift);
    activeGl.uniform1f(activeGlass.ribbonHorizon, targetRibbonHorizon());
  }

  function draw(): void {
    if (!gl || !glass || contextLost) return;
    resize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook.
    gl.useProgram(glass.program);
    const reduced = reducedMotion();
    advanceMotion(reduced);
    uploadUniforms(gl, glass, reduced);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (canvas.dataset.glassReady !== "true") canvas.dataset.glassReady = "true";
  }

  function visible(): boolean {
    return intersecting && pageVisible;
  }

  function tick(): void {
    rafId = 0;
    if (destroyed || !visible() || contextLost) return;
    draw();
    if (reducedMotion()) {
      staticFrameDrawn = true;
      return;
    }
    staticFrameDrawn = false;
    rafId = requestAnimationFrame(tick);
  }

  /* single entry point: (re)starts the loop, or repaints the one static frame in reduced motion */
  function invalidate(): void {
    staticFrameDrawn = false;
    if (destroyed || !visible() || contextLost || rafId !== 0) return;
    rafId = requestAnimationFrame(tick);
  }

  function handleVisibility(): void {
    pageVisible = !document.hidden;
    invalidate();
  }

  function handleContextLost(event: Event): void {
    // preventDefault signals we want the context back; the browser then fires webglcontextrestored.
    event.preventDefault();
    contextLost = true;
    if (rafId !== 0) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function handleContextRestored(): void {
    // hoisted declaration: re-narrow gl locally (the outer guard's narrowing doesn't flow in)
    if (!gl) return;
    contextLost = false;
    glass = buildProgram(gl);
    invalidate();
  }

  /* observers only INVALIDATE — the actual buffer resize happens inside draw() (see resize) */
  const resizeObserver = new ResizeObserver(() => {
    invalidate();
  });
  resizeObserver.observe(canvas);

  /* pause offscreen (previews below the fold, background tabs keep GPU idle) */
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) intersecting = entry.isIntersecting;
      invalidate();
    },
    { rootMargin: "64px" },
  );
  intersectionObserver.observe(canvas);

  /* the docs theme editor toggles data-motion on <html> live; repaint (or restart) when it flips */
  const motionObserver = new MutationObserver(() => {
    if (!staticFrameDrawn || !reducedMotion()) invalidate();
  });
  motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });

  function handleMotionPreference(): void {
    invalidate();
  }

  document.addEventListener("visibilitychange", handleVisibility);
  reducedMotionQuery.addEventListener("change", handleMotionPreference);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);

  invalidate();

  return () => {
    destroyed = true;
    if (rafId !== 0) cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    motionObserver.disconnect();
    document.removeEventListener("visibilitychange", handleVisibility);
    reducedMotionQuery.removeEventListener("change", handleMotionPreference);
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
