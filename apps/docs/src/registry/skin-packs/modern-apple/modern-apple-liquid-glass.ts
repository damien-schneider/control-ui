import { LIQUID_GLASS_OPTICS_GLSL } from "@/components/control-ui/lib/liquid-glass-optics";

export type AppleLiquidGlassProfile = "modal" | "regular";

export type AppleLiquidGlassCapture = {
  frosted: HTMLCanvasElement;
  region: AppleLiquidGlassRegion;
  scale: number;
  sharp: HTMLCanvasElement;
};

export type AppleLiquidGlassRegion = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type AppleLiquidGlassSurface = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  profile: AppleLiquidGlassProfile;
};

export type AppleLiquidGlassEngine = {
  destroy: () => void;
  maxTextureSize: number;
  render: (capture: AppleLiquidGlassCapture, surfaces: readonly AppleLiquidGlassSurface[]) => boolean;
};

type CaptureOptions = {
  excludeSelector: string;
  frost?: number;
  maxTextureSize?: number;
  overscan?: number;
  pixelBudget?: number;
};

type LiquidProgram = {
  appearance: WebGLUniformLocation | null;
  blurTex: WebGLUniformLocation | null;
  blurTexture: WebGLTexture;
  buffer: WebGLBuffer;
  captureOrigin: WebGLUniformLocation | null;
  captureSize: WebGLUniformLocation | null;
  cornerExponent: WebGLUniformLocation | null;
  centerDiffusion: WebGLUniformLocation | null;
  edgeDiffusion: WebGLUniformLocation | null;
  edgeDarkening: WebGLUniformLocation | null;
  edgeHighlight: WebGLUniformLocation | null;
  edgeRatio: WebGLUniformLocation | null;
  fill: WebGLUniformLocation | null;
  fresnel: WebGLUniformLocation | null;
  panelOrigin: WebGLUniformLocation | null;
  program: WebGLProgram;
  radii: WebGLUniformLocation | null;
  refraction: WebGLUniformLocation | null;
  sharpTex: WebGLUniformLocation | null;
  sharpTexture: WebGLTexture;
  size: WebGLUniformLocation | null;
  specular: WebGLUniformLocation | null;
  zRadius: WebGLUniformLocation | null;
};

type MaterialTuning = {
  centerDiffusion: number;
  edgeDiffusion: number;
  edgeDarkening: number;
  edgeHighlight: number;
  edgeRatio: number;
  fill: number;
  fresnel: number;
  refraction: number;
  specular: number;
  zRadius: number;
};

const vertexShader = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D u_sharpTex;
uniform sampler2D u_blurTex;
uniform vec2 u_size;
uniform vec2 u_panelOrigin;
uniform vec2 u_captureOrigin;
uniform vec2 u_captureSize;
uniform vec4 u_radii;
uniform float u_cornerExponent;
uniform float u_zRadius;
uniform float u_edgeRatio;
uniform float u_refraction;
uniform float u_edgeDarkening;
uniform float u_specular;
uniform float u_fresnel;
uniform float u_edgeHighlight;
uniform float u_centerDiffusion;
uniform float u_edgeDiffusion;
uniform float u_fill;
uniform float u_appearance;

varying vec2 v_uv;

${LIQUID_GLASS_OPTICS_GLSL}

float quadrantRadius(vec2 point) {
  if (point.y < 0.0) return point.x < 0.0 ? u_radii.x : u_radii.y;
  return point.x < 0.0 ? u_radii.w : u_radii.z;
}

vec2 captureUV(vec2 viewportPosition) {
  return clamp((viewportPosition - u_captureOrigin) / u_captureSize, 0.0, 1.0);
}

void main() {
  vec2 local = (v_uv - 0.5) * u_size;
  vec2 halfSize = u_size * 0.5;
  float radius = min(quadrantRadius(local), min(halfSize.x, halfSize.y));
  float sdf = liquidSurfaceSDF(local, halfSize, radius, u_cornerExponent);
  float mask = 1.0 - smoothstep(-1.5, 0.5, sdf);

  if (mask <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float edgeWidth = liquidEdgeWidth(u_size, u_edgeRatio, u_zRadius);
  float opticalInside = liquidOpticalInsideDistance(local, halfSize, radius, u_cornerExponent);
  float lens = liquidEdgeLens(opticalInside, edgeWidth);
  vec2 boundaryNormal = liquidInwardOpticalNormal(local, halfSize, radius, u_cornerExponent);
  vec2 refractedOffset = liquidRefractedOffset(boundaryNormal, opticalInside, edgeWidth, u_refraction);
  vec2 samplePosition = u_panelOrigin + v_uv * u_size + refractedOffset;
  vec3 sharp = texture2D(u_sharpTex, captureUV(samplePosition)).rgb;
  vec3 frosted = texture2D(u_blurTex, captureUV(samplePosition)).rgb;
  vec3 color = mix(sharp, frosted, mix(u_centerDiffusion, u_edgeDiffusion, lens));

  float transmittedLuma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float blackEndpoint = mix(0.20, 0.05, u_appearance);
  float whiteEndpoint = mix(0.95, 0.80, u_appearance);
  float mappedLuma = mix(blackEndpoint, whiteEndpoint, transmittedLuma);
  color = clamp(color + vec3(mappedLuma - transmittedLuma), 0.0, 1.0);
  vec3 materialTint = mix(vec3(1.0), vec3(0.035), u_appearance);
  color = mix(color, materialTint, mix(u_fill, u_fill * 0.38, lens));

  vec2 keyDirection = normalize(vec2(0.707106, -0.707106));
  float outerRim = 1.0 - smoothstep(0.35, 1.35, opticalInside);
  float innerRim = exp(-pow((opticalInside - 2.0) / 0.9, 2.0));
  float keyArc = pow(max(dot(boundaryNormal, keyDirection), 0.0), 6.0);
  float fillArc = pow(max(dot(boundaryNormal, -keyDirection), 0.0), 8.0) * 0.28;
  float shadowArc = pow(max(dot(boundaryNormal, -keyDirection), 0.0), 6.0);
  color *= 1.0 - innerRim * shadowArc * u_edgeDarkening;
  float highlight = outerRim * u_edgeHighlight * 0.22 + innerRim * (keyArc * u_specular + fillArc * u_specular * 1.3);
  float grazing = outerRim * u_fresnel * 0.025;
  vec3 rimLight = mix(vec3(1.0), frosted, 0.12);
  vec3 material = color + rimLight * highlight + vec3(grazing);

  gl_FragColor = vec4(material * mask, mask);
}
`;

function numberToken(styles: CSSStyleDeclaration, name: string, fallback: number): number {
  const value = Number.parseFloat(styles.getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

function materialTuning(host: HTMLElement, profile: AppleLiquidGlassProfile): MaterialTuning {
  const styles = getComputedStyle(host);
  const modal = profile === "modal";
  return {
    refraction: numberToken(styles, modal ? "--apple-liquid-modal-refraction" : "--apple-liquid-refraction", modal ? 0.92 : 0.85),
    zRadius: numberToken(styles, "--apple-liquid-edge-band", 32),
    edgeRatio: numberToken(styles, modal ? "--apple-liquid-modal-edge-ratio" : "--apple-liquid-edge-ratio", modal ? 0.25 : 0.36),
    edgeDarkening: numberToken(styles, "--apple-liquid-edge-darkening", 0.025),
    specular: numberToken(styles, "--apple-liquid-specular", 0.11),
    fresnel: numberToken(styles, "--apple-liquid-fresnel", 0.35),
    edgeHighlight: numberToken(styles, "--apple-liquid-edge-highlight", 0.16),
    centerDiffusion: numberToken(
      styles,
      modal ? "--apple-liquid-modal-center-diffusion" : "--apple-liquid-center-diffusion",
      modal ? 0.82 : 0.38,
    ),
    edgeDiffusion: numberToken(
      styles,
      modal ? "--apple-liquid-modal-edge-diffusion" : "--apple-liquid-edge-diffusion",
      modal ? 0.32 : 0.08,
    ),
    fill: numberToken(styles, modal ? "--apple-liquid-modal-fill" : "--apple-liquid-fill", modal ? 0.6 : 0.32),
  };
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createTexture(gl: WebGLRenderingContext): WebGLTexture | null {
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
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const sharpTexture = createTexture(gl);
  const blurTexture = createTexture(gl);
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
    panelOrigin: gl.getUniformLocation(program, "u_panelOrigin"),
    captureOrigin: gl.getUniformLocation(program, "u_captureOrigin"),
    captureSize: gl.getUniformLocation(program, "u_captureSize"),
    radii: gl.getUniformLocation(program, "u_radii"),
    cornerExponent: gl.getUniformLocation(program, "u_cornerExponent"),
    zRadius: gl.getUniformLocation(program, "u_zRadius"),
    edgeRatio: gl.getUniformLocation(program, "u_edgeRatio"),
    refraction: gl.getUniformLocation(program, "u_refraction"),
    edgeDarkening: gl.getUniformLocation(program, "u_edgeDarkening"),
    specular: gl.getUniformLocation(program, "u_specular"),
    fresnel: gl.getUniformLocation(program, "u_fresnel"),
    edgeHighlight: gl.getUniformLocation(program, "u_edgeHighlight"),
    centerDiffusion: gl.getUniformLocation(program, "u_centerDiffusion"),
    edgeDiffusion: gl.getUniformLocation(program, "u_edgeDiffusion"),
    fill: gl.getUniformLocation(program, "u_fill"),
    appearance: gl.getUniformLocation(program, "u_appearance"),
  };
}

function radius(
  styles: CSSStyleDeclaration,
  property: "borderTopLeftRadius" | "borderTopRightRadius" | "borderBottomRightRadius" | "borderBottomLeftRadius",
  host: HTMLElement,
): number {
  const value = Number.parseFloat(styles[property]);
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), Math.min(host.clientWidth, host.clientHeight) / 2) : 0;
}

function cornerExponent(styles: CSSStyleDeclaration): number {
  if (!CSS.supports("corner-shape: squircle")) return 2;
  const shape = [
    styles.getPropertyValue("corner-shape"),
    styles.getPropertyValue("--corner-shape-popover"),
    styles.getPropertyValue("--corner-shape-panel"),
    styles.getPropertyValue("--corner-shape"),
  ]
    .join(" ")
    .toLowerCase();
  return shape.includes("squircle") || shape.includes("superellipse") ? 4 : 2;
}

function darkAppearance(host: HTMLElement): number {
  return host.closest(".dark") || document.documentElement.classList.contains("dark") ? 1 : 0;
}

function uploadCapture(gl: WebGLRenderingContext, liquid: LiquidProgram, capture: AppleLiquidGlassCapture): boolean {
  try {
    for (let index = 0; index < 8 && gl.getError() !== gl.NO_ERROR; index += 1) {
      // Drain stale errors so the checks below describe these uploads.
    }
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, liquid.sharpTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, capture.sharp);
    if (gl.getError() !== gl.NO_ERROR) return false;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, liquid.blurTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, capture.frosted);
    return gl.getError() === gl.NO_ERROR;
  } catch {
    return false;
  }
}

function setCaptureUniforms(gl: WebGLRenderingContext, liquid: LiquidProgram, capture: AppleLiquidGlassCapture): void {
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is not a React hook.
  gl.useProgram(liquid.program);
  gl.uniform1i(liquid.sharpTex, 0);
  gl.uniform1i(liquid.blurTex, 1);
  gl.uniform2f(liquid.captureOrigin, capture.region.left, capture.region.top);
  gl.uniform2f(liquid.captureSize, capture.region.width, capture.region.height);
}

function setSurfaceUniforms(
  gl: WebGLRenderingContext,
  liquid: LiquidProgram,
  host: HTMLElement,
  profile: AppleLiquidGlassProfile,
  cssWidth: number,
  cssHeight: number,
): void {
  const hostRect = host.getBoundingClientRect();
  const styles = getComputedStyle(host);
  const tuning = materialTuning(host, profile);
  gl.uniform2f(liquid.size, cssWidth, cssHeight);
  gl.uniform2f(liquid.panelOrigin, hostRect.left, hostRect.top);
  gl.uniform4f(
    liquid.radii,
    radius(styles, "borderTopLeftRadius", host),
    radius(styles, "borderTopRightRadius", host),
    radius(styles, "borderBottomRightRadius", host),
    radius(styles, "borderBottomLeftRadius", host),
  );
  gl.uniform1f(liquid.cornerExponent, cornerExponent(styles));
  gl.uniform1f(liquid.zRadius, tuning.zRadius);
  gl.uniform1f(liquid.edgeRatio, tuning.edgeRatio);
  gl.uniform1f(liquid.refraction, tuning.refraction);
  gl.uniform1f(liquid.edgeDarkening, tuning.edgeDarkening);
  gl.uniform1f(liquid.specular, tuning.specular);
  gl.uniform1f(liquid.fresnel, tuning.fresnel);
  gl.uniform1f(liquid.edgeHighlight, tuning.edgeHighlight);
  gl.uniform1f(liquid.centerDiffusion, tuning.centerDiffusion);
  gl.uniform1f(liquid.edgeDiffusion, tuning.edgeDiffusion);
  gl.uniform1f(liquid.fill, tuning.fill);
  gl.uniform1f(liquid.appearance, darkAppearance(host));
}

function renderSurface(
  gl: WebGLRenderingContext,
  scratch: HTMLCanvasElement,
  liquid: LiquidProgram,
  { canvas, host, profile }: AppleLiquidGlassSurface,
): boolean {
  const context = canvas.getContext("2d");
  if (!context) return false;
  const cssWidth = Math.max(1, host.clientWidth);
  const cssHeight = Math.max(1, host.clientHeight);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(cssWidth * dpr));
  const height = Math.max(1, Math.round(cssHeight * dpr));
  if (scratch.width !== width) scratch.width = width;
  if (scratch.height !== height) scratch.height = height;
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is not a React hook.
  gl.useProgram(liquid.program);
  setSurfaceUniforms(gl, liquid, host, profile, cssWidth, cssHeight);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.flush();
  if (gl.getError() !== gl.NO_ERROR) return false;

  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  context.clearRect(0, 0, width, height);
  context.drawImage(scratch, 0, 0, width, height);
  return true;
}

function renderCapture(
  gl: WebGLRenderingContext,
  scratch: HTMLCanvasElement,
  liquid: LiquidProgram,
  capture: AppleLiquidGlassCapture,
  surfaces: readonly AppleLiquidGlassSurface[],
  upload: boolean,
): boolean {
  if (upload && !uploadCapture(gl, liquid, capture)) return false;
  setCaptureUniforms(gl, liquid, capture);
  if (surfaces.length === 0) return false;
  return surfaces.every((surface) => renderSurface(gl, scratch, liquid, surface));
}

export function createAppleLiquidGlassEngine(onContextStateChange?: (available: boolean) => void): AppleLiquidGlassEngine | null {
  const scratch = document.createElement("canvas");
  const gl = scratch.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return null;
  let liquid = buildProgram(gl);
  if (!liquid) return null;
  let destroyed = false;
  let contextLost = false;
  let uploadedCapture: AppleLiquidGlassCapture | null = null;

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    uploadedCapture = null;
    onContextStateChange?.(false);
  };
  const handleContextRestored = () => {
    contextLost = false;
    liquid = buildProgram(gl);
    uploadedCapture = null;
    onContextStateChange?.(liquid !== null);
  };
  scratch.addEventListener("webglcontextlost", handleContextLost);
  scratch.addEventListener("webglcontextrestored", handleContextRestored);

  // getParameter is typed any and returns null on a lost context; fall back to the capture default.
  const maxTextureSize: unknown = gl.getParameter(gl.MAX_TEXTURE_SIZE);

  return {
    maxTextureSize: typeof maxTextureSize === "number" ? maxTextureSize : 4096,
    render(capture, surfaces) {
      if (destroyed || contextLost || !liquid) return false;
      const upload = uploadedCapture !== capture;
      const rendered = renderCapture(gl, scratch, liquid, capture, surfaces, upload);
      if (rendered && upload) uploadedCapture = capture;
      return rendered;
    },
    destroy() {
      destroyed = true;
      scratch.removeEventListener("webglcontextlost", handleContextLost);
      scratch.removeEventListener("webglcontextrestored", handleContextRestored);
      if (liquid && !gl.isContextLost()) {
        gl.deleteProgram(liquid.program);
        gl.deleteBuffer(liquid.buffer);
        gl.deleteTexture(liquid.sharpTexture);
        gl.deleteTexture(liquid.blurTexture);
      }
      liquid = null;
      uploadedCapture = null;
    },
  };
}

const capturedStyleProperties = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "appearance",
  "aspect-ratio",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-repeat",
  "background-size",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "bottom",
  "box-shadow",
  "box-sizing",
  "clear",
  "clip",
  "clip-path",
  "color",
  "color-scheme",
  "column-gap",
  "column-width",
  "columns",
  "contain",
  "content-visibility",
  "direction",
  "display",
  "fill",
  "fill-opacity",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-size",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "gap",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-row",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "height",
  "hyphens",
  "image-rendering",
  "inset",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "left",
  "letter-spacing",
  "line-height",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "mask",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "mix-blend-mode",
  "object-fit",
  "object-position",
  "opacity",
  "order",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "position",
  "right",
  "rotate",
  "row-gap",
  "scale",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-style",
  "text-indent",
  "text-overflow",
  "text-shadow",
  "text-transform",
  "text-wrap",
  "top",
  "transform",
  "transform-box",
  "transform-origin",
  "translate",
  "unicode-bidi",
  "vertical-align",
  "visibility",
  "white-space",
  "width",
  "word-break",
  "word-spacing",
  "writing-mode",
  "z-index",
] as const;

function cloneCanvas(source: HTMLCanvasElement): HTMLImageElement | null {
  try {
    const image = document.createElement("img");
    image.src = source.toDataURL();
    image.setAttribute("style", computedCssText(source));
    return image;
  } catch {
    return null;
  }
}

function syncLiveValue(source: Element, clone: Element): void {
  if (source instanceof HTMLInputElement && clone instanceof HTMLInputElement) clone.value = source.value;
  if (source instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) clone.value = source.value;
  if (source instanceof HTMLImageElement && clone instanceof HTMLImageElement && source.currentSrc) clone.src = source.currentSrc;
}

function appendClonedChildren(source: Element, clone: Element, excludeSelector: string, region: AppleLiquidGlassRegion): void {
  for (const child of source.childNodes) {
    if (child instanceof Element) {
      const childClone = cloneTree(child, excludeSelector, region);
      if (childClone) clone.appendChild(childClone);
      continue;
    }
    if (child.nodeType === Node.TEXT_NODE) clone.appendChild(child.cloneNode(false));
  }
}

function intersectsRegion(source: Element, region: AppleLiquidGlassRegion): boolean {
  if (source === document.body) return true;
  const rect = source.getBoundingClientRect();
  if (getComputedStyle(source).display === "contents") return true;
  return (
    rect.right > region.left && rect.bottom > region.top && rect.left < region.left + region.width && rect.top < region.top + region.height
  );
}

function clonePlaceholder(source: Element): Element | null {
  const clone = source.cloneNode(false);
  if (!(clone instanceof Element)) return null;
  clone.setAttribute("style", computedCssText(source));
  if (!(clone instanceof HTMLElement)) return clone;
  const rect = source.getBoundingClientRect();
  Object.assign(clone.style, {
    height: `${Math.max(0, rect.height)}px`,
    minHeight: "0",
    minWidth: "0",
    overflow: "hidden",
    visibility: "hidden",
    width: `${Math.max(0, rect.width)}px`,
  });
  return clone;
}

function cloneTree(source: Element, excludeSelector: string, region: AppleLiquidGlassRegion): Element | null {
  if (source.matches(excludeSelector)) return null;
  if (!intersectsRegion(source, region)) return clonePlaceholder(source);
  if (source instanceof HTMLCanvasElement) return cloneCanvas(source);
  const clone = source.cloneNode(false);
  if (!(clone instanceof Element)) return null;
  clone.setAttribute("style", computedCssText(source));
  syncLiveValue(source, clone);
  appendClonedChildren(source, clone, excludeSelector, region);
  return clone;
}

function computedCssText(source: Element): string {
  const computed = getComputedStyle(source);
  const declarations = capturedStyleProperties.map((property) => `${property}: ${computed.getPropertyValue(property)};`);
  declarations.push("animation: none !important; transition: none !important; caret-color: transparent !important;");
  return declarations.join(" ");
}

function regionForHosts(hosts: readonly HTMLElement[], overscan: number): AppleLiquidGlassRegion | null {
  const rects = hosts.flatMap((host) => {
    const rect = host.getBoundingClientRect();
    const visible =
      rect.width > 0 &&
      rect.height > 0 &&
      rect.right > 0 &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.top < window.innerHeight;
    return visible ? [rect] : [];
  });
  if (rects.length === 0) return null;
  const left = Math.max(0, Math.floor(Math.min(...rects.map((rect) => rect.left)) - overscan));
  const top = Math.max(0, Math.floor(Math.min(...rects.map((rect) => rect.top)) - overscan));
  const right = Math.min(window.innerWidth, Math.ceil(Math.max(...rects.map((rect) => rect.right)) + overscan));
  const bottom = Math.min(window.innerHeight, Math.ceil(Math.max(...rects.map((rect) => rect.bottom)) + overscan));
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

function scaleCanvas(source: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

function frostCanvas(sharp: HTMLCanvasElement, frost: number): HTMLCanvasElement | null {
  const frosted = document.createElement("canvas");
  frosted.width = sharp.width;
  frosted.height = sharp.height;
  const context = frosted.getContext("2d");
  if (!context) return null;
  if (frost <= 1) {
    context.drawImage(sharp, 0, 0);
    return frosted;
  }

  const targetWidth = Math.max(1, Math.round(sharp.width / frost));
  const targetHeight = Math.max(1, Math.round(sharp.height / frost));
  let reduced: HTMLCanvasElement | null = sharp;
  let width = sharp.width;
  let height = sharp.height;
  while (reduced && width * 0.5 >= targetWidth) {
    width = Math.max(targetWidth, Math.round(width * 0.5));
    height = Math.max(targetHeight, Math.round(height * 0.5));
    reduced = scaleCanvas(reduced, width, height);
  }
  if (reduced && (reduced.width !== targetWidth || reduced.height !== targetHeight))
    reduced = scaleCanvas(reduced, targetWidth, targetHeight);
  const bounced = reduced
    ? scaleCanvas(reduced, Math.max(1, Math.round(targetWidth / 2)), Math.max(1, Math.round(targetHeight / 2)))
    : null;
  const smoothed = bounced ? (scaleCanvas(bounced, targetWidth, targetHeight) ?? reduced) : reduced;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(smoothed ?? sharp, 0, 0, frosted.width, frosted.height);
  return frosted;
}

function captureScale(region: AppleLiquidGlassRegion, maxTextureSize: number, pixelBudget: number): number {
  const desired = Math.min((window.devicePixelRatio || 1) * 1.25, 2.5);
  const dimensionLimit = maxTextureSize / Math.max(region.width, region.height, 1);
  const pixelLimit = Math.sqrt(pixelBudget / Math.max(region.width * region.height, 1));
  return Math.min(desired, dimensionLimit, pixelLimit);
}

function decodeImage(image: HTMLImageElement): Promise<void> {
  if (typeof image.decode === "function") return image.decode();
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to decode liquid glass capture"));
  });
}

async function decodeSvg(svg: string): Promise<CanvasImageSource | null> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    } catch {
      // Older WebKit builds need the image decoder path.
    }
  }
  const image = new Image();
  image.decoding = "async";
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  try {
    await decodeImage(image);
    return image;
  } catch {
    return null;
  }
}

export async function captureAppleLiquidGlassBackdrop(
  hosts: readonly HTMLElement[],
  { excludeSelector, frost = 10, maxTextureSize = 4096, overscan = 64, pixelBudget = 6_000_000 }: CaptureOptions,
): Promise<AppleLiquidGlassCapture | null> {
  const region = regionForHosts(hosts, overscan);
  if (!region) return null;
  const bodyClone = cloneTree(document.body, excludeSelector, region);
  if (!(bodyClone instanceof HTMLElement)) return null;
  const bodyRect = document.body.getBoundingClientRect();

  const stage = document.createElement("div");
  const rootStyles = getComputedStyle(document.documentElement);
  stage.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  Object.assign(stage.style, {
    backgroundColor: rootStyles.backgroundColor,
    backgroundImage: rootStyles.backgroundImage,
    backgroundPosition: rootStyles.backgroundPosition,
    backgroundRepeat: rootStyles.backgroundRepeat,
    backgroundSize: rootStyles.backgroundSize,
    height: `${region.height}px`,
    overflow: "hidden",
    position: "relative",
    width: `${region.width}px`,
  });
  Object.assign(bodyClone.style, {
    height: "auto",
    left: `${bodyRect.left - region.left}px`,
    margin: "0",
    minHeight: `${Math.max(document.documentElement.scrollHeight, window.innerHeight)}px`,
    position: "absolute",
    top: `${bodyRect.top - region.top}px`,
    width: `${bodyRect.width}px`,
  });
  stage.appendChild(bodyClone);

  const scale = captureScale(region, maxTextureSize, pixelBudget);
  const width = Math.max(1, Math.round(region.width * scale));
  const height = Math.max(1, Math.round(region.height * scale));
  const markup = new XMLSerializer().serializeToString(stage);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${region.width} ${region.height}"><foreignObject width="${region.width}" height="${region.height}">${markup}</foreignObject></svg>`;
  const image = await decodeSvg(svg);
  if (!image) return null;

  const sharp = document.createElement("canvas");
  sharp.width = width;
  sharp.height = height;
  const context = sharp.getContext("2d");
  if (!context) {
    if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) image.close();
    return null;
  }
  try {
    context.drawImage(image, 0, 0, width, height);
  } catch {
    return null;
  } finally {
    if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) image.close();
  }
  const frosted = frostCanvas(sharp, frost);
  return frosted ? { sharp, frosted, region, scale } : null;
}
