export class Grid<T> {
  // A sparse array with a known max width/height so that we may easily access any specific row.
  private cells: T[];
  dimensions: Vec2;

  constructor(dimensions: Vec2) {
    this.cells = new Array<T>(dimensions[0] * dimensions[1]);
    this.dimensions = dimensions;
  }

  get(coords: Vec2): T | undefined {
    // TODO: error if looking outside the width or height.
    return this.cells[coords[1] * this.dimensions[0] + coords[0]] ?? undefined;
  }

  set(coords: Vec2, value: T) {
    this.cells[coords[1] * this.dimensions[0] + coords[0]] = value;
  }
}
