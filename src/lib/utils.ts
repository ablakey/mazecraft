export function lerp(start: number, end: number, percent: number) {
  return start + (end - start) * percent;
}

export function invLerp(start: number, end: number, value: number) {
  return (value - start) / (end - start);
}

export function toHex(rgb: readonly [number, number, number]): string {
  return `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1].toString(16).padStart(2, "0")}${rgb[2]
    .toString(16)
    .padStart(2, "0")}`;
}

/**
 * Asserts a condition.
 * Borrowed from ts-essentials.
 */
export function assert(condition: any, msg = "no info provided by developer."): asserts condition {
  if (!condition) {
    throw new Error("Assertion Error for " + msg);
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

export function setDebug(text: string) {
  document.querySelector("#debug")!.innerHTML = text;
}

export function getElementSize(selector: string): Vec2 {
  const el = document.querySelector<HTMLElement>(selector);
  assert(el);
  return [el.offsetWidth, el.offsetHeight];
}
