export function lerp(start: number, end: number, percent: number) {
  return start + (end - start) * percent;
}

export function invLerp(start: number, end: number, value: number) {
  return (value - start) / (end - start);
}

export function toHex(rgb: readonly [number, number, number]): string {
  return `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1].toString(16).padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}`;
}
