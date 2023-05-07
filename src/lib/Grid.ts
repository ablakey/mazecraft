export class Grid {
  private dimensions: Vec2;
  private map: Map<number, number> = new Map();

  constructor(dimensions: Vec2) {
    this.dimensions = dimensions;
  }

  get(coords: Vec2) {
    return this.map.get(coords[1] * this.dimensions[0] + coords[0]);
  }

  set(coords: Vec2, value: number) {
    this.map.set(coords[1] * this.dimensions[0] + coords[0], value);
  }

  clear() {
    this.map.clear();
  }

  forEach(callback: (value: number, coords: Vec2) => void) {
    this.map.forEach((v, k) => {
      const x = k % this.dimensions[0];
      const y = Math.floor(k / this.dimensions[0]);
      callback(v, [x, y]);
    });
  }
}
