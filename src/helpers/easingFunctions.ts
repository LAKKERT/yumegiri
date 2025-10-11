export function easeInQuad(t: number) {
  return t * t;
}

export function LongInEaseOut(t: number) {
  return Math.pow(t, 2) * (3 - 2 * t);
}

export function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
