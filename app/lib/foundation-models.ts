export function ndcPercentToPixel(value: number, width: number) {
  const normalized = Math.min(100, Math.max(-100, value));
  return Math.round(((normalized + 100) / 200) * width);
}

export function imageBufferBytes(width: number, height: number, bitsPerPixel: number) {
  return Math.ceil((Math.max(0, width) * Math.max(0, height) * Math.max(0, bitsPerPixel)) / 8);
}

export function displayInterval(renderTime: number, refreshInterval = 16.7) {
  return Math.ceil(Math.max(0, renderTime) / refreshInterval) * refreshInterval;
}

export function depthsCollide(separation: number, highPrecision: boolean) {
  return separation < (highPrecision ? 4 : 24);
}
