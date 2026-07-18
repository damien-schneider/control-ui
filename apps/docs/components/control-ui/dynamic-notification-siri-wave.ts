export const DYNAMIC_NOTIFICATION_SIRI_WAVE_GLSL = /* glsl */ `
const float SIRI_PI = 3.14159265359;
const float SIRI_AMPLITUDE = 0.32;
const float SIRI_FREQUENCY = 1.1;
const float SIRI_ABERRATION_FREQUENCY = 1.0;
const float SIRI_SPEED = 2.4;
const float SIRI_WAVE_SCALE = 0.6;
const float SIRI_ABERRATION = 2.6;
const float SIRI_THICKNESS = 3.0;
const float SIRI_INTENSITY = 2.0;
const float SIRI_FALLOFF = 1.7;
const float SIRI_EDGE_MASK = 0.4;
const float SIRI_BAND_FILL = 30000.0;
const float SIRI_BAND_THICKNESS = 0.08;
const float SIRI_SOFTNESS = 2.5;
const float SIRI_LOW_AMPLITUDE = 6.0;
const float SIRI_LOW_INTENSITY = 1.5;
const float SIRI_MID_ABERRATION = 0.8;
const float SIRI_MID_ABERRATION_AMPLITUDE = 0.05;
const float SIRI_MID_SOFTNESS = 0.4;
const float SIRI_HIGH_ABERRATION = 0.5;
const float SIRI_HIGH_ABERRATION_AMPLITUDE = 0.06;

vec3 siriSpectrum(int strand) {
  float x = float(strand);
  return clamp(vec3(abs(x - 3.0) - 1.0, 2.0 - abs(x - 2.0), 2.0 - abs(x - 4.0)), 0.0, 1.0);
}

vec3 dynamicNotificationSiriWave(vec2 uv, vec2 resolution, float time, float horizon, float lift) {
  float aspect = resolution.x / max(resolution.y, 1.0);
  vec2 p = vec2((uv.x * 2.0 - 1.0) * aspect, (uv.y - horizon + lift * 0.55) * 2.0);
  float screenY = p.y;
  p /= max(SIRI_WAVE_SCALE, 0.1);

  float low = clamp(0.45 + 0.45 * sin(time * 0.8) * sin(time * 0.37 + 1.0), 0.0, 1.0);
  float mid = clamp(0.40 + 0.40 * sin(time * 1.7 + 2.0) * sin(time * 0.53), 0.0, 1.0);
  float high = clamp(0.30 + 0.30 * sin(time * 2.9 + 4.0) * sin(time * 0.71 + 2.0), 0.0, 1.0);
  float drift = mod(time, 20.0 * SIRI_PI) * SIRI_SPEED;

  float horizontalPosition = uv.x * 2.0 - 1.0;
  float envelope = cos(SIRI_PI * 0.5 * min(abs(0.9 * horizontalPosition), 1.0));
  envelope *= envelope;

  float primaryAmplitude = SIRI_AMPLITUDE + 0.01 * low * SIRI_LOW_AMPLITUDE;
  float strandAmplitude = primaryAmplitude + mid * SIRI_MID_ABERRATION_AMPLITUDE + high * SIRI_HIGH_ABERRATION_AMPLITUDE;
  float aberration = SIRI_ABERRATION + mid * SIRI_MID_ABERRATION + high * SIRI_HIGH_ABERRATION;
  float thickness = 0.01 * SIRI_THICKNESS;
  float intensity = 0.01 * (SIRI_INTENSITY + low * SIRI_LOW_INTENSITY);
  float softness = 0.01 * max(0.0, SIRI_SOFTNESS + mid * SIRI_MID_SOFTNESS);
  float primaryY = primaryAmplitude * envelope * sin(p.x * SIRI_FREQUENCY + drift);
  float bandAmount = 1e-4 * SIRI_BAND_FILL * intensity;

  vec3 numerator = vec3(0.0);
  vec3 denominator = vec3(0.0);
  for (int strand = 0; strand < 4; strand++) {
    vec3 hue = siriSpectrum(strand);
    denominator += hue;
    float phase = mix(-aberration, aberration, float(strand) / 3.0);
    float strandY = strandAmplitude * envelope * sin(p.x * SIRI_ABERRATION_FREQUENCY + drift + phase);
    float distanceToStrand = abs(p.y - strandY);
    float line = intensity / (sqrt(distanceToStrand * distanceToStrand + softness * softness) + thickness);
    float bandLow = min(primaryY, strandY);
    float bandHigh = max(primaryY, strandY);
    float distanceToBand = max(0.0, max(p.y - bandHigh, bandLow - p.y));
    float band = bandAmount / (distanceToBand + SIRI_BAND_THICKNESS);
    numerator += hue * (line + band);
  }

  vec3 color = numerator / max(denominator, vec3(0.0001));
  float primaryDistance = abs(p.y - primaryY);
  color += 0.5 * intensity / (sqrt(primaryDistance * primaryDistance + softness * softness) + thickness);
  color = pow(max(color, 0.0), vec3(1.5));

  float edgeFadePosition = clamp((abs(screenY) - 1.0) / -SIRI_EDGE_MASK, 0.0, 1.0);
  float edgeFade = edgeFadePosition * edgeFadePosition * (3.0 - 2.0 * edgeFadePosition);
  color *= edgeFade * exp(-pow(horizontalPosition * SIRI_FALLOFF, 2.0));
  return color;
}
`;
