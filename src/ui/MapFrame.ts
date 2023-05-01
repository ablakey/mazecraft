import { GLCanvas } from "./GLCanvas";

const TILE_SIZE = 24;
const BORDER_SIZE = 1;
const CELL_SIZE = TILE_SIZE + BORDER_SIZE;

export class MapFrame {
  private width: number;
  private height: number;

  // Pixel coordinates of the very top-left pixel.
  private originX: number;
  private originY: number;

  private glcanvas: GLCanvas;

  constructor(w: number, h: number, initialX: number, initialY: number) {
    this.glcanvas = new GLCanvas(w, h, "#mapframe");
    this.width = w;
    this.height = h;

    // Pixel coordinates of the top-left of the current view. Can never be negative.
    this.originX = initialX * CELL_SIZE;
    this.originY = initialY * CELL_SIZE;
  }

  render() {
    this.originX++;
    this.originY++;
    this.drawTiles();
  }

  drawTiles() {
    const numCols = Math.ceil(this.width / CELL_SIZE);
    const numRows = Math.ceil(this.height / CELL_SIZE);

    // Whole cell offsets.
    const xCell = Math.floor(this.originX / CELL_SIZE);
    const yCell = Math.floor(this.originY / CELL_SIZE);

    // Fractional cell offsets.
    const xFrac = this.originX % CELL_SIZE;
    const yFrac = this.originY % CELL_SIZE;

    for (let row = -1; row < numRows + 1; row++) {
      for (let col = -1; col < numCols + 1; col++) {
        const x = row + xCell;
        const y = col + yCell;
        const tileId = Game.world.getCell(x, y);

        // Optimization: if the tile is empty, just draw nothing.
        if (tileId === 0) {
          continue;
        }

        const tile = Game.tiles.get(tileId);
        this.glcanvas.drawImage(tile.img, row * CELL_SIZE - xFrac, col * CELL_SIZE - yFrac, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
