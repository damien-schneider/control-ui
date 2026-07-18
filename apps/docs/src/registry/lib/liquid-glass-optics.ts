export const LIQUID_GLASS_OPTICS_GLSL = /* glsl */ `
const float LIQUID_GLASS_REFRACTIVE_INDEX = 1.5;

float liquidPLength(vec2 value, float exponent) {
  return pow(pow(value.x, exponent) + pow(value.y, exponent), 1.0 / exponent);
}

float liquidSurfaceSDF(vec2 point, vec2 halfSize, float cornerRadius, float cornerExponent) {
  float radius = min(cornerRadius, min(halfSize.x, halfSize.y));
  vec2 q = abs(point) - halfSize + vec2(radius);
  vec2 outside = max(q, vec2(0.0));
  float corner = liquidPLength(outside, cornerExponent);
  return min(max(q.x, q.y), 0.0) + corner - radius;
}

float liquidOpticalInsideDistance(
  vec2 point,
  vec2 halfSize,
  float cornerRadius,
  float cornerExponent
) {
  return max(-liquidSurfaceSDF(point, halfSize, cornerRadius, cornerExponent), 0.0);
}

vec2 liquidInwardOpticalNormal(
  vec2 point,
  vec2 halfSize,
  float cornerRadius,
  float cornerExponent
) {
  float epsilon = 0.35;
  vec2 gradient = vec2(
    liquidSurfaceSDF(point + vec2(epsilon, 0.0), halfSize, cornerRadius, cornerExponent)
      - liquidSurfaceSDF(point - vec2(epsilon, 0.0), halfSize, cornerRadius, cornerExponent),
    liquidSurfaceSDF(point + vec2(0.0, epsilon), halfSize, cornerRadius, cornerExponent)
      - liquidSurfaceSDF(point - vec2(0.0, epsilon), halfSize, cornerRadius, cornerExponent)
  );
  float gradientLength = length(gradient);
  if (gradientLength <= 0.0001) return vec2(0.0);
  return -gradient / gradientLength;
}

float liquidEdgeWidth(vec2 size, float edgeRatio, float edgeCap) {
  vec2 halfSize = size * 0.5;
  float requestedWidth = min(max(min(size.x, size.y) * edgeRatio, 18.0), edgeCap);
  return min(requestedWidth, max(min(halfSize.x, halfSize.y) - 1.0, 0.001));
}

float liquidEdgeLens(float opticalInside, float edgeWidth) {
  float edgeDistance = clamp(opticalInside / max(edgeWidth, 0.001), 0.0, 1.0);
  return pow(1.0 - edgeDistance, 1.35);
}

float liquidConvexSurfaceSlopeForExponent(float radialDistance, float exponent) {
  float profile = max(1.0 - pow(radialDistance, exponent), 0.0001);
  return pow(radialDistance, exponent - 1.0) * pow(profile, 1.0 / exponent - 1.0);
}

float liquidConvexSurfaceSlope(float opticalInside, float edgeWidth) {
  float edgeDistance = clamp(opticalInside / max(edgeWidth, 0.001), 0.0005, 0.9995);
  float radialDistance = 1.0 - edgeDistance;
  float squircleSlope = liquidConvexSurfaceSlopeForExponent(radialDistance, 4.0);
  float circularSlope = liquidConvexSurfaceSlopeForExponent(radialDistance, 2.0);
  return min(mix(squircleSlope, circularSlope, 0.55), 12.0);
}

vec3 liquidLensSurfaceNormal(vec2 inwardNormal, float opticalInside, float edgeWidth) {
  float slope = liquidConvexSurfaceSlope(opticalInside, edgeWidth);
  return normalize(vec3(-inwardNormal * slope, 1.0));
}

vec2 liquidRefractedOffset(
  vec2 inwardNormal,
  float opticalInside,
  float edgeWidth,
  float depthScale
) {
  float edgeDistance = clamp(opticalInside / max(edgeWidth, 0.001), 0.0, 1.0);
  if (edgeDistance >= 1.0) return vec2(0.0);

  vec3 surfaceNormal = liquidLensSurfaceNormal(inwardNormal, opticalInside, edgeWidth);
  vec3 ray = refract(vec3(0.0, 0.0, -1.0), surfaceNormal, 1.0 / LIQUID_GLASS_REFRACTIVE_INDEX);
  vec2 snellOffset = ray.xy / max(-ray.z, 0.2) * edgeWidth * depthScale;

  float radialDistance = 1.0 - edgeDistance;
  float circularRoll = 1.0 - sqrt(max(1.0 - radialDistance * radialDistance, 0.0));
  vec2 rollOffset = inwardNormal * circularRoll * edgeWidth * 0.18;
  float interiorFade = 1.0 - smoothstep(0.82, 1.0, edgeDistance);
  vec2 offset = (snellOffset + rollOffset) * interiorFade;
  float maximumOffset = edgeWidth * 1.05;
  return offset * min(1.0, maximumOffset / max(length(offset), 0.0001));
}
`;
