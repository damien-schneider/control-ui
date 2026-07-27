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

/* only while thinking — static pill and opened chat stay clean */
function auroraTarget(state: string | undefined): number {
  return state === "thinking" ? 1 : 0;
}

/* only collapsed pill is solid black */
function revealTarget(state: string | undefined): number {
  return state === "collapsed" ? 0 : 1;
}

/* picks ink ramp: thinking runs out to transparent, expanded keeps floor under its reply controls */
function settleTarget(state: string | undefined): number {
  return state === "expanded" ? 1 : 0;
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

  let destroyed = false;
  let intersecting = true;
  let pageVisible = !document.hidden;
  let rafId = 0;
  let dpr = 1;
  let radius = 0;
  let aurora = auroraTarget(canvas.parentElement?.dataset.state);
  /* sends dying sheet toward top on exit; parked high whenever aurora is off */
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

  /* Called from draw(), never an observer: setting canvas.width clears the buffer, and rAF ticks run
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

  function advanceMotion(reduced: boolean): void {
    const target = targetRadius();
    radius = reduced ? target : radius + (target - radius) * 0.25;

    const auroraGoal = auroraTarget(canvas.parentElement?.dataset.state);
    aurora = reduced ? auroraGoal : aurora + (auroraGoal - aurora) * 0.06;
    /* linear exit so sheet clears surface before opening morph collapses */
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

  /* restarts loop, or repaints single static frame under reduced motion */
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
    // preventDefault asks for context back — browser then fires webglcontextrestored
    event.preventDefault();
    contextLost = true;
    if (rafId !== 0) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function handleContextRestored(): void {
    // hoisted, so outer guard's narrowing does not flow in
    if (!gl) return;
    contextLost = false;
    glass = buildProgram(gl);
    invalidate();
  }

  const resizeObserver = new ResizeObserver(() => {
    invalidate();
  });
  resizeObserver.observe(canvas);

  /* pauses offscreen so previews below fold keep GPU idle */
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) intersecting = entry.isIntersecting;
      invalidate();
    },
    { rootMargin: "64px" },
  );
  intersectionObserver.observe(canvas);

  /* theme editor toggles data-motion on <html> live */
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
