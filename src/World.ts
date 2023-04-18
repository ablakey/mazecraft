export class World {
  width: number;
  height: number;
  cells: number[];

  constructor() {
    this.width = 10;
    this.height = 10;
    this.cells = new Array(this.width * this.height); // Make a box.

    // generate a box.
    this.forEachCell((x, y) => {
      if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
        this.setCell(x, y, 1);
      }
    });
  }

  forEachCell(callback: (x: number, y: number, value: number) => void) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        callback(x, y, this.getCell(x, y));
      }
    }
  }

  getCell(x: number, y: number) {
    // TODO: error if looking outside the width or height.
    return this.cells[y * this.width + x] ?? 0;
  }

  setCell(x: number, y: number, value: number) {
    this.cells[y * this.width + x] = value;
  }
}
