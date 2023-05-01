const MAX_WIDTH = 10_000;
const MAX_HEIGHT = 10_000;

export class World {
  // A sparse array with a known max width/height so that we may easily access any specific row.
  cells: number[] = new Array(MAX_WIDTH * MAX_HEIGHT);

  constructor() {
    // generate a box. (TODO: Proof of concept)
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        if (x === 0 || y === 0 || x === 20 - 1 || y === 20 - 1) {
          this.setCell(x, y, 1);
        } else if (Math.random() > 0.95) {
          this.setCell(x, y, 1);
          // Generate some random things on the map for demo purposes.
        }
      }
    }
  }

  getCell(x: number, y: number) {
    // TODO: error if looking outside the width or height.
    return this.cells[y * MAX_WIDTH + x] ?? Game.tiles.defaultTile;
  }

  setCell(x: number, y: number, value: number) {
    this.cells[y * MAX_WIDTH + x] = value;
  }
}
