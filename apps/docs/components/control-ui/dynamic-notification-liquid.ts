import { DYNAMIC_NOTIFICATION_SIRI_WAVE_GLSL } from "@/components/control-ui/dynamic-notification-siri-wave";
import { LIQUID_GLASS_OPTICS_GLSL } from "@/components/control-ui/lib/liquid-glass-optics";

/* Keep full-surface transmission separate from the narrow edge-light field so refraction stays visible without a halo. */

export type DynamicNotificationLiquidOptions = {
  /** Virtual lens depth (default 0.85) applied to the size-derived inner edge profile. */
  refraction?: number;
  /** Chromatic aberration (default 0) — optional RGB separation; Apple does not expose it as a material property. */
  chromaticAberration?: number;
  /** Inner refraction band cap in css px (default 32). */
  zRadius?: number;
  /** Directional dark edge intensity (default 0.05). */
  edgeDarkening?: number;
  /** Opposed perimeter highlight intensity (default 0.11). */
  specular?: number;
  /** Grazing reflection intensity (default 0.35). */
  fresnel?: number;
  /** Edge highlight intensity (default 0.16). */
  edgeHighlight?: number;
  /** Frost factor for shader-native diffusion (default 4). The centre remains sharp-dominant. */
  frost?: number;
  /** devicePixelRatio clamp (default 2). */
  maxDpr?: number;
};

const VERTEX_SHADER = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  /* v_uv is y-DOWN (v=0 = top) to match the 2D-canvas texture orientation */
  v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/* The optical field runs in css px with a y-down local frame centred on the panel. */
const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform sampler2D u_sharpTex;
uniform sampler2D u_blurTex;
uniform vec2 u_size;        /* panel size, css px */
uniform vec2 u_panelOffset; /* panel top-left inside the scene, css px */
uniform vec2 u_sceneSize;   /* scene size, css px */
uniform float u_radius;     /* corner radius, css px */
uniform float u_zRadius;    /* inner refraction band cap, css px */
uniform float u_refract;
uniform float u_chroma;
uniform float u_edgeDarkening;
uniform float u_spec;
uniform float u_fresnel;
uniform float u_edgeHL;
uniform float u_time;
uniform float u_aurora;
uniform float u_reveal;
uniform float u_settle;
uniform float u_lift;
uniform float u_ribbonHorizon;

varying vec2 v_uv;

${LIQUID_GLASS_OPTICS_GLSL}
${DYNAMIC_NOTIFICATION_SIRI_WAVE_GLSL}

vec2 sceneUV(vec2 posCss) {
  return clamp(posCss / u_sceneSize, 0.0, 1.0);
}

void main() {
  vec2 local = (v_uv - 0.5) * u_size;
  vec2 half_ = u_size * 0.5;
  float r = min(u_radius, min(half_.x, half_.y));
  float sdf = liquidSurfaceSDF(local, half_, r, 2.0);

  /* The mask clips only the shape; resting Clear material has no separate shadow stage. */
  float mask = 1.0 - smoothstep(-1.5, 0.5, sdf);
  if (mask <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float materialScale = smoothstep(40.0, 120.0, u_size.y);
  float edgeWidth = liquidEdgeWidth(u_size, 0.36, u_zRadius);
  float opticalInside = liquidOpticalInsideDistance(local, half_, r, 2.0);
  float lens = liquidEdgeLens(opticalInside, edgeWidth);
  vec2 boundaryNormal = liquidInwardOpticalNormal(local, half_, r, 2.0);

  vec2 refrPx = liquidRefractedOffset(boundaryNormal, opticalInside, edgeWidth, u_refract);
  vec3 N = liquidLensSurfaceNormal(boundaryNormal, opticalInside, edgeWidth);
  vec2 keyDirection = normalize(vec2(0.707106, -0.707106));
  float outerRim = 1.0 - smoothstep(0.35, 1.35, opticalInside);
  float innerRim = exp(-pow((opticalInside - 2.0) / 0.9, 2.0));

  float caS = u_chroma * 10.0 * lens;
  vec2 caD = N.xy * caS;
  vec2 base = u_panelOffset + v_uv * u_size + refrPx;

  vec3 sharp = vec3(
    texture2D(u_sharpTex, sceneUV(base + caD)).r,
    texture2D(u_sharpTex, sceneUV(base)).g,
    texture2D(u_sharpTex, sceneUV(base - caD)).b
  );
  vec3 blur = vec3(
    texture2D(u_blurTex, sceneUV(base + caD)).r,
    texture2D(u_blurTex, sceneUV(base)).g,
    texture2D(u_blurTex, sceneUV(base - caD)).b
  );
  float diffusion = mix(0.08, 0.14, materialScale) * mix(0.25, 1.0, lens);
  vec3 col = mix(sharp, blur, diffusion);

  /* Map transmitted luminance to the measured Clear-material endpoints while preserving hue. */
  float transmittedLuma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float environmentLuma = dot(blur, vec3(0.2126, 0.7152, 0.0722));
  float lightEnvironment = smoothstep(0.38, 0.72, environmentLuma);
  float blackEndpoint = mix(0.05, 0.20, lightEnvironment);
  float whiteEndpoint = mix(0.80, 0.95, lightEnvironment);
  float mappedLuma = mix(blackEndpoint, whiteEndpoint, transmittedLuma);
  col = clamp(col + vec3(mappedLuma - transmittedLuma), 0.0, 1.0);

  /* Ink and ribbon share the refracted coordinate so their horizon stays joined at the edges. */
  vec2 auroraUv = clamp(v_uv + N.xy * lens * 0.012, vec2(0.0), vec2(1.0));
  float yUp = 1.0 - auroraUv.y;
  float inkThinking = mix(0.10, 0.985, smoothstep(u_ribbonHorizon - 0.10, u_ribbonHorizon + 0.10, yUp));
  float inkExpanded = mix(0.24, 0.97, smoothstep(0.00, 0.30, yUp));
  float ink = mix(0.985, mix(inkThinking, inkExpanded, u_settle), u_reveal);
  vec3 materialColor = mix(col, vec3(0.004, 0.004, 0.006), ink);

  float keyArc = pow(max(dot(boundaryNormal, keyDirection), 0.0), 6.0);
  float fillArc = pow(max(dot(boundaryNormal, -keyDirection), 0.0), 8.0) * 0.28;
  float shadowArc = pow(max(dot(boundaryNormal, -keyDirection), 0.0), 6.0);
  materialColor *= 1.0 - innerRim * shadowArc * u_edgeDarkening;
  float highlight = outerRim * u_edgeHL * 0.22 + innerRim * (keyArc * u_spec + fillArc * u_spec * 1.3);
  float grazing = outerRim * u_fresnel * 0.025;
  vec3 rimLight = mix(vec3(1.0), blur, 0.12);

  vec3 auroraEmission = dynamicNotificationSiriWave(vec2(auroraUv.x, yUp), u_size, u_time, u_ribbonHorizon, u_lift)
    * u_aurora * (1.0 - u_lift);

  vec3 material = materialColor + rimLight * highlight + vec3(grazing) + auroraEmission;
  gl_FragColor = vec4(material * mask, mask);
}
`;

type LiquidProgram = {
  program: WebGLProgram;
  buffer: WebGLBuffer;
  sharpTexture: WebGLTexture;
  blurTexture: WebGLTexture;
  sharpTex: WebGLUniformLocation | null;
  blurTex: WebGLUniformLocation | null;
  size: WebGLUniformLocation | null;
  panelOffset: WebGLUniformLocation | null;
  sceneSize: WebGLUniformLocation | null;
  radius: WebGLUniformLocation | null;
  zRadius: WebGLUniformLocation | null;
  refract: WebGLUniformLocation | null;
  chroma: WebGLUniformLocation | null;
  edgeDarkening: WebGLUniformLocation | null;
  spec: WebGLUniformLocation | null;
  fresnel: WebGLUniformLocation | null;
  edgeHL: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
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

function createSceneTexture(gl: WebGLRenderingContext): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

function buildProgram(gl: WebGLRenderingContext): LiquidProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const sharpTexture = createSceneTexture(gl);
  const blurTexture = createSceneTexture(gl);
  if (!program || !buffer || !sharpTexture || !blurTexture) return null;
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
    sharpTexture,
    blurTexture,
    sharpTex: gl.getUniformLocation(program, "u_sharpTex"),
    blurTex: gl.getUniformLocation(program, "u_blurTex"),
    size: gl.getUniformLocation(program, "u_size"),
    panelOffset: gl.getUniformLocation(program, "u_panelOffset"),
    sceneSize: gl.getUniformLocation(program, "u_sceneSize"),
    radius: gl.getUniformLocation(program, "u_radius"),
    zRadius: gl.getUniformLocation(program, "u_zRadius"),
    refract: gl.getUniformLocation(program, "u_refract"),
    chroma: gl.getUniformLocation(program, "u_chroma"),
    edgeDarkening: gl.getUniformLocation(program, "u_edgeDarkening"),
    spec: gl.getUniformLocation(program, "u_spec"),
    fresnel: gl.getUniformLocation(program, "u_fresnel"),
    edgeHL: gl.getUniformLocation(program, "u_edgeHL"),
    time: gl.getUniformLocation(program, "u_time"),
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

function revealTarget(state: string | undefined): number {
  return state === "collapsed" ? 0 : 1;
}

function settleTarget(state: string | undefined): number {
  return state === "expanded" ? 1 : 0;
}

function approachAt60Hz(current: number, target: number, response: number, deltaMs: number): number {
  const frameScale = Math.max(0, deltaMs) / (1000 / 60);
  return current + (target - current) * (1 - (1 - response) ** frameScale);
}

const EXCLUDE_SELECTOR = '[data-control-ui="dynamic-notification"]';

type EmbeddedImages = ReadonlyMap<string, string>;

function cssImageUrls(value: string): string[] {
  return Array.from(value.matchAll(/url\((["']?)(.*?)\1\)/g), (match) => match[2]?.trim()).filter((url): url is string =>
    Boolean(url && !url.startsWith("data:") && !url.startsWith("#")),
  );
}

function sceneImageUrls(scene: HTMLElement): Set<string> {
  const urls = new Set<string>();
  for (const element of [scene, ...scene.querySelectorAll("*")]) {
    if (element.closest(EXCLUDE_SELECTOR)) continue;
    if (element instanceof HTMLImageElement && element.currentSrc && !element.currentSrc.startsWith("data:")) {
      urls.add(element.currentSrc);
    }
    const computed = getComputedStyle(element);
    for (let index = 0; index < computed.length; index += 1) {
      for (const url of cssImageUrls(computed.getPropertyValue(computed.item(index)))) urls.add(url);
    }
  }
  return urls;
}

function blobDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(typeof reader.result === "string" ? reader.result : null), { once: true });
    reader.addEventListener("error", () => resolve(null), { once: true });
    reader.readAsDataURL(blob);
  });
}

async function fetchImageDataUrl(url: string): Promise<string | null> {
  try {
    const resolved = new URL(url, document.baseURI);
    const sameOrigin = resolved.origin === window.location.origin;
    const response = await fetch(resolved, {
      cache: "force-cache",
      credentials: sameOrigin ? "same-origin" : "omit",
      mode: sameOrigin ? "same-origin" : "cors",
    });
    if (!response.ok) return null;
    return blobDataUrl(await response.blob());
  } catch {
    return null;
  }
}

async function embedSceneImages(scene: HTMLElement): Promise<EmbeddedImages | null> {
  const urls = [...sceneImageUrls(scene)];
  const dataUrls = await Promise.all(urls.map(fetchImageDataUrl));
  const images = new Map<string, string>();
  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    const dataUrl = dataUrls[index];
    if (!url || !dataUrl) return null;
    images.set(url, dataUrl);
  }
  return images;
}

function embedCssImages(value: string, images: EmbeddedImages): string {
  return value.replace(/url\((["']?)(.*?)\1\)/g, (match, _quote: string, url: string) => {
    const embedded = images.get(url.trim());
    return embedded ? `url("${embedded}")` : match;
  });
}

function cloneCanvas(source: HTMLCanvasElement): HTMLImageElement | null {
  try {
    const snapshot = document.createElement("img");
    snapshot.src = source.toDataURL();
    snapshot.setAttribute("style", getComputedStyle(source).cssText);
    return snapshot;
  } catch {
    return null;
  }
}

function computedStyleText(source: Element, images: EmbeddedImages): string {
  const computed = getComputedStyle(source);
  const parts: string[] = [];
  for (let index = 0; index < computed.length; index += 1) {
    const property = computed.item(index);
    parts.push(`${property}: ${embedCssImages(computed.getPropertyValue(property), images)};`);
  }
  return parts.join(" ");
}

function appendClonedChildren(source: Element, target: Element, images: EmbeddedImages): void {
  for (const child of source.childNodes) {
    if (child instanceof Element) {
      const cloned = cloneTree(child, images);
      if (cloned) target.appendChild(cloned);
    } else if (child.nodeType === Node.TEXT_NODE) {
      target.appendChild(child.cloneNode(false));
    }
  }
}

/* Recursive clone with computed styles inlined — the SVG-image sandbox can't reach stylesheets. */
function cloneTree(source: Element, images: EmbeddedImages): Element | null {
  if (source.matches(EXCLUDE_SELECTOR)) return null;

  /* canvases can't paint inside an SVG image: snapshot them into an <img> */
  if (source instanceof HTMLCanvasElement) return cloneCanvas(source);

  const node = source.cloneNode(false);
  if (!(node instanceof Element)) return null;

  node.setAttribute("style", computedStyleText(source, images));
  if (source instanceof HTMLImageElement && node instanceof HTMLImageElement) {
    const embedded = images.get(source.currentSrc);
    if (embedded) node.src = embedded;
    node.removeAttribute("srcset");
    node.removeAttribute("sizes");
  }
  if (source instanceof HTMLSourceElement && source.parentElement instanceof HTMLPictureElement) {
    node.removeAttribute("srcset");
    node.removeAttribute("sizes");
  }
  appendClonedChildren(source, node, images);
  return node;
}

type SceneCapture = { sharp: HTMLCanvasElement; frosted: HTMLCanvasElement };
type SceneCaptureDimensions = {
  width: number;
  height: number;
  rasterWidth: number;
  rasterHeight: number;
};

function scaleCanvas(source: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement | null {
  const step = document.createElement("canvas");
  step.width = width;
  step.height = height;
  const context = step.getContext("2d");
  if (!context) return null;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return step;
}

function sceneCaptureDimensions(scene: HTMLElement, scale: number): SceneCaptureDimensions {
  const rect = scene.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  return {
    width,
    height,
    rasterWidth: Math.max(1, Math.round(width * scale)),
    rasterHeight: Math.max(1, Math.round(height * scale)),
  };
}

function prepareSceneClone(scene: HTMLElement, dimensions: SceneCaptureDimensions, images: EmbeddedImages): HTMLElement | null {
  const clone = cloneTree(scene, images);
  if (!(clone instanceof HTMLElement)) return null;

  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  clone.style.width = `${dimensions.width}px`;
  clone.style.height = `${dimensions.height}px`;
  clone.style.margin = "0";
  clone.style.boxSizing = "border-box";
  return clone;
}

async function decodeSceneImage(clone: HTMLElement, dimensions: SceneCaptureDimensions): Promise<HTMLImageElement | null> {
  const markup = new XMLSerializer().serializeToString(clone);
  const { width, height, rasterWidth, rasterHeight } = dimensions;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rasterWidth}" height="${rasterHeight}" viewBox="0 0 ${width} ${height}"><foreignObject width="${width}" height="${height}">${markup}</foreignObject></svg>`;
  const image = new Image();
  image.decoding = "async";
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  try {
    await image.decode();
    return image;
  } catch {
    return null;
  }
}

function drawSharpScene(image: HTMLImageElement, dimensions: SceneCaptureDimensions): HTMLCanvasElement | null {
  const sharp = document.createElement("canvas");
  sharp.width = dimensions.rasterWidth;
  sharp.height = dimensions.rasterHeight;
  const context = sharp.getContext("2d");
  if (!context) return null;
  context.drawImage(image, 0, 0, sharp.width, sharp.height);
  return sharp;
}

function downsampleForFrost(sharp: HTMLCanvasElement, frost: number): HTMLCanvasElement | null {
  const targetWidth = Math.max(1, Math.round(sharp.width / frost));
  const targetHeight = Math.max(1, Math.round(sharp.height / frost));
  let small: HTMLCanvasElement | null = sharp;
  let stepWidth = sharp.width;
  let stepHeight = sharp.height;

  while (small && stepWidth * 0.5 >= targetWidth) {
    stepWidth = Math.max(targetWidth, Math.round(stepWidth * 0.5));
    stepHeight = Math.max(targetHeight, Math.round(stepHeight * 0.5));
    small = scaleCanvas(small, stepWidth, stepHeight);
  }

  if (small && (small.width !== targetWidth || small.height !== targetHeight)) {
    small = scaleCanvas(small, targetWidth, targetHeight);
  }
  if (!small) return null;

  const bounced = scaleCanvas(small, Math.max(1, Math.round(targetWidth / 2)), Math.max(1, Math.round(targetHeight / 2)));
  return bounced ? (scaleCanvas(bounced, targetWidth, targetHeight) ?? small) : small;
}

function drawFrostedScene(sharp: HTMLCanvasElement, frost: number): HTMLCanvasElement | null {
  const frosted = document.createElement("canvas");
  frosted.width = sharp.width;
  frosted.height = sharp.height;
  const context = frosted.getContext("2d");
  if (!context) return null;

  if (frost <= 1) {
    context.drawImage(sharp, 0, 0);
    return frosted;
  }

  /* Raster-relative downsampling keeps roughly one texel per CSS pixel on high-density screens. */
  const smoothed = downsampleForFrost(sharp, frost);
  if (smoothed) {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(smoothed, 0, 0, frosted.width, frosted.height);
  } else {
    context.drawImage(sharp, 0, 0);
  }
  return frosted;
}

/* Rasterize the scene (minus islands) → sharp + frosted 2D canvases. The frost pass is a
   downscale/upscale blur (portable approximate gaussian: 2D-context filters are missing in Safari). */
async function captureScene(scene: HTMLElement, scale: number, frost: number): Promise<SceneCapture | null> {
  const images = await embedSceneImages(scene);
  if (!images) return null;
  const dimensions = sceneCaptureDimensions(scene, scale);
  const clone = prepareSceneClone(scene, dimensions, images);
  if (!clone) return null;
  const image = await decodeSceneImage(clone, dimensions);
  if (!image) return null;
  const sharp = drawSharpScene(image, dimensions);
  if (!sharp) return null;
  const frosted = drawFrostedScene(sharp, frost);
  if (!frosted) return null;
  return { sharp, frosted };
}

export function createDynamicNotificationLiquid(canvas: HTMLCanvasElement, options: DynamicNotificationLiquidOptions = {}): () => void {
  const {
    refraction = 0.85,
    chromaticAberration = 0,
    zRadius = 32,
    edgeDarkening = 0.05,
    specular = 0.11,
    fresnel = 0.35,
    edgeHighlight = 0.16,
    frost = 4,
    maxDpr = 2,
  } = options;
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) {
    canvas.dataset.glassFailed = "webgl";
    return () => {
      delete canvas.dataset.glassFailed;
    };
  }

  const closestScene = canvas.closest("[data-dn-scene]");
  const scene = closestScene instanceof HTMLElement ? closestScene : document.body;

  /* Cleanup only deletes GL objects and NEVER loseContext(): a lose()d context can't hand out
     WEBGL_lose_context anymore, so a StrictMode remount on the same canvas could never recover. */
  let contextLost = gl.isContextLost();
  let liquid = contextLost ? null : buildProgram(gl);
  if (!contextLost && !liquid) {
    canvas.dataset.glassFailed = "shader";
    return () => {
      delete canvas.dataset.glassFailed;
    };
  }

  let destroyed = false;
  let intersecting = true;
  let pageVisible = !document.hidden;
  let rafId = 0;
  let dpr = 1;
  let radius = 0;
  const initialState = canvas.parentElement?.dataset.state;
  let aurora = auroraTarget(initialState);
  let reveal = revealTarget(initialState);
  let settle = settleTarget(initialState);
  /* lift sends the dying sheet toward the top on exit; parked high whenever the aurora is off */
  let lift = 1 - aurora;
  let staticFrameDrawn = false;
  /* last successful capture, kept for instant re-upload after a context restore */
  let captured: SceneCapture | null = null;
  let textureFresh = false;
  let captureToken = 0;
  let captureTimer = 0;
  const startedAt = performance.now();
  let previousFrameAt = startedAt;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function reducedMotion(): boolean {
    return reducedMotionQuery.matches || canvas.closest('[data-motion="reduced"]') !== null;
  }

  function targetRadius(host: HTMLElement): number {
    const parsed = Number.parseFloat(getComputedStyle(host).borderTopLeftRadius);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function targetRibbonHorizon(host: HTMLElement): number {
    const parsed = Number.parseFloat(getComputedStyle(host).getPropertyValue("--dn-ribbon-horizon"));
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed / 100)) : 0.5;
  }

  /* Runs at the TOP of every draw, never from observers: setting canvas.width clears the buffer,
     so resize and repaint must share one task or the compositor shows a blank frame (flicker). */
  function resize(): void {
    // clientWidth/Height: layout box, immune to the @starting-style scale running at mount.
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function uploadTexture(): void {
    if (!gl || !liquid || contextLost || !captured) return;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, liquid.sharpTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captured.sharp);
    gl.bindTexture(gl.TEXTURE_2D, liquid.blurTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captured.frosted);
    textureFresh = true;
  }

  function recapture(): void {
    captureToken += 1;
    const token = captureToken;
    /* Supersample beyond dpr so sub-pixel edge optics stay clean without unbounded texture memory. */
    const rect = scene.getBoundingClientRect();
    const supersample = Math.min((window.devicePixelRatio || 1) * 1.5, 3, 4096 / Math.max(rect.width, rect.height, 1));
    void captureScene(scene, Math.max(1, supersample), frost).then((result) => {
      if (destroyed || token !== captureToken) return;
      if (!result) {
        captured = null;
        textureFresh = false;
        delete canvas.dataset.glassReady;
        canvas.dataset.glassFailed = "capture";
        return;
      }
      captured = result;
      delete canvas.dataset.glassFailed;
      uploadTexture();
      invalidate();
    });
  }

  function scheduleRecapture(): void {
    window.clearTimeout(captureTimer);
    captureTimer = window.setTimeout(recapture, 200);
  }

  type MotionTargets = {
    radius: number;
    aurora: number;
    reveal: number;
    settle: number;
    lift: number;
  };

  function advanceMotion(host: HTMLElement, reduced: boolean, deltaMs: number): MotionTargets {
    const state = host.dataset.state;
    const targetAurora = auroraTarget(state);
    const targets = {
      radius: targetRadius(host),
      aurora: targetAurora,
      reveal: revealTarget(state),
      settle: settleTarget(state),
      lift: targetAurora >= 0.5 ? 0 : 1,
    };

    radius = reduced ? targets.radius : approachAt60Hz(radius, targets.radius, 0.25, deltaMs);
    aurora = reduced ? targets.aurora : approachAt60Hz(aurora, targets.aurora, 0.06, deltaMs);
    reveal = reduced ? targets.reveal : approachAt60Hz(reveal, targets.reveal, 0.07, deltaMs);
    settle = reduced ? targets.settle : approachAt60Hz(settle, targets.settle, 0.07, deltaMs);
    /* Keep exit linear so the aurora clears the surface before it collapses. */
    if (reduced) lift = targets.lift;
    else if (targets.lift === 1) lift = Math.min(1, lift + deltaMs * 0.00216);
    else lift = approachAt60Hz(lift, 0, 0.28, deltaMs);

    return targets;
  }

  function shouldAnimate(host: HTMLElement, reduced: boolean, targets: MotionTargets): boolean {
    return (
      !reduced &&
      (host.dataset.state === "thinking" ||
        Math.abs(radius - targets.radius) > 0.05 ||
        Math.abs(aurora - targets.aurora) > 0.002 ||
        Math.abs(reveal - targets.reveal) > 0.002 ||
        Math.abs(settle - targets.settle) > 0.002 ||
        Math.abs(lift - targets.lift) > 0.002)
    );
  }

  function draw(): boolean {
    if (!gl || !liquid || contextLost || !textureFresh) return false;
    const host = canvas.parentElement;
    if (!host) return false;
    resize();
    const hostRect = host.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    if (sceneRect.width < 1 || sceneRect.height < 1) return false;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram, not a React hook.
    gl.useProgram(liquid.program);
    const reduced = reducedMotion();
    const now = performance.now();
    const deltaMs = Math.min(100, now - previousFrameAt);
    previousFrameAt = now;
    const targets = advanceMotion(host, reduced, deltaMs);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, liquid.sharpTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, liquid.blurTexture);
    gl.uniform1i(liquid.sharpTex, 0);
    gl.uniform1i(liquid.blurTex, 1);
    gl.uniform2f(liquid.size, Math.max(1, canvas.clientWidth), Math.max(1, canvas.clientHeight));
    gl.uniform2f(liquid.panelOffset, hostRect.left - sceneRect.left, hostRect.top - sceneRect.top);
    gl.uniform2f(liquid.sceneSize, sceneRect.width, sceneRect.height);
    gl.uniform1f(liquid.radius, radius);
    gl.uniform1f(liquid.zRadius, zRadius);
    gl.uniform1f(liquid.refract, refraction);
    gl.uniform1f(liquid.chroma, chromaticAberration);
    gl.uniform1f(liquid.edgeDarkening, edgeDarkening);
    gl.uniform1f(liquid.spec, specular);
    gl.uniform1f(liquid.fresnel, fresnel);
    gl.uniform1f(liquid.edgeHL, edgeHighlight);
    gl.uniform1f(liquid.time, reduced ? 4.2 : (now - startedAt) / 1000);
    gl.uniform1f(liquid.aurora, aurora);
    gl.uniform1f(liquid.reveal, reveal);
    gl.uniform1f(liquid.settle, settle);
    gl.uniform1f(liquid.lift, lift);
    gl.uniform1f(liquid.ribbonHorizon, targetRibbonHorizon(host));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    delete canvas.dataset.glassFailed;
    if (canvas.dataset.glassReady !== "true") canvas.dataset.glassReady = "true";
    return shouldAnimate(host, reduced, targets);
  }

  function visible(): boolean {
    return intersecting && pageVisible;
  }

  function tick(): void {
    rafId = 0;
    if (destroyed || !visible() || contextLost) return;
    const keepAnimating = draw();
    if (!keepAnimating) {
      staticFrameDrawn = true;
      return;
    }
    staticFrameDrawn = false;
    rafId = requestAnimationFrame(tick);
  }

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
    event.preventDefault();
    contextLost = true;
    textureFresh = false;
    delete canvas.dataset.glassReady;
    canvas.dataset.glassFailed = "context";
    if (rafId !== 0) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function handleContextRestored(): void {
    if (!gl) return;
    contextLost = false;
    liquid = buildProgram(gl);
    if (!liquid) {
      canvas.dataset.glassFailed = "shader";
      return;
    }
    uploadTexture();
    invalidate();
  }

  /* observers only INVALIDATE — the actual buffer resize happens inside draw() (see resize) */
  const resizeObserver = new ResizeObserver(() => {
    invalidate();
  });
  resizeObserver.observe(canvas);

  /* the scene resizing changes the capture geometry, not just the viewport */
  const sceneResizeObserver = new ResizeObserver(() => {
    scheduleRecapture();
  });
  sceneResizeObserver.observe(scene);

  /* re-rasterize when the backdrop actually changes — mutations inside any island are the morph
     itself animating and must NOT trigger captures (the island is excluded from the raster anyway) */
  const sceneMutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target;
      const element = target instanceof Element ? target : target.parentElement;
      if (element?.closest(EXCLUDE_SELECTOR)) continue;
      scheduleRecapture();
      return;
    }
  });
  sceneMutationObserver.observe(scene, { attributes: true, characterData: true, childList: true, subtree: true });

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) intersecting = entry.isIntersecting;
      invalidate();
    },
    { rootMargin: "64px" },
  );
  intersectionObserver.observe(canvas);

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

  recapture();
  invalidate();

  return () => {
    destroyed = true;
    if (rafId !== 0) cancelAnimationFrame(rafId);
    window.clearTimeout(captureTimer);
    resizeObserver.disconnect();
    sceneResizeObserver.disconnect();
    sceneMutationObserver.disconnect();
    intersectionObserver.disconnect();
    motionObserver.disconnect();
    document.removeEventListener("visibilitychange", handleVisibility);
    reducedMotionQuery.removeEventListener("change", handleMotionPreference);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    delete canvas.dataset.glassReady;
    delete canvas.dataset.glassFailed;
    if (liquid && !gl.isContextLost()) {
      gl.deleteProgram(liquid.program);
      gl.deleteBuffer(liquid.buffer);
      gl.deleteTexture(liquid.sharpTexture);
      gl.deleteTexture(liquid.blurTexture);
    }
    liquid = null;
    captured = null;
  };
}
