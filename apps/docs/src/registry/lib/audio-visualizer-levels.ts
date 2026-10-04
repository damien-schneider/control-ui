export function audioVisualizerPointCount(points = 28) {
  return Math.min(128, Math.max(1, Number.isFinite(points) ? Math.floor(points) : 28));
}

export function normalizeAudioLevel(level: number) {
  return Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0;
}

export function audioVisualizerHistory(levels: ArrayLike<number>, points?: number, active = true) {
  const count = audioVisualizerPointCount(points);
  const start = Math.max(0, levels.length - count);
  const padding = Math.max(0, count - levels.length);
  return Array.from({ length: count }, (_, index) => ({
    key: `bar-${index}`,
    level: active && index >= padding ? normalizeAudioLevel(levels[start + index - padding] ?? 0) : 0,
  }));
}

export function audioVisualizerBands(levels: ArrayLike<number>, points?: number, active = true, mirrored = false) {
  const count = audioVisualizerPointCount(points);
  const bandCount = mirrored ? Math.ceil(count / 2) : count;
  const bands = Array.from({ length: bandCount }, (_, index) => {
    if (!active || levels.length === 0) return 0;
    const start = (index * levels.length) / bandCount;
    const end = ((index + 1) * levels.length) / bandCount;
    let total = 0;
    for (let sample = Math.floor(start); sample < Math.ceil(end); sample += 1) {
      const weight = Math.min(end, sample + 1) - Math.max(start, sample);
      total += normalizeAudioLevel(levels[sample] ?? 0) * weight;
    }
    return total / (end - start);
  });

  return Array.from({ length: count }, (_, index) => ({
    key: `band-${index}`,
    level: bands[mirrored ? Math.floor(Math.abs(index - (count - 1) / 2)) : index] ?? 0,
  }));
}
