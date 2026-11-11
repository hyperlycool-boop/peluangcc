function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function interpolatePiecewise(val: number, inRange: readonly number[], outRange: readonly number[]): number {
  if (val <= inRange[0]) return outRange[0];
  const lastIdx = inRange.length - 1;
  if (val >= inRange[lastIdx]) return outRange[lastIdx];

  for (let i = 0; i < lastIdx; i++) {
    const x0 = inRange[i];
    const x1 = inRange[i + 1];
    if (val >= x0 && val <= x1) {
      const span = x1 - x0;
      const t = span === 0 ? 0 : (val - x0) / span;
      return lerp(outRange[i], outRange[i + 1], t);
    }
  }

  return outRange[lastIdx];
}
