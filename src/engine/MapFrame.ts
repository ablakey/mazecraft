import { GLCanvas, GLCanvasMouseEventType } from "./GLCanvas";

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

  // Mouse event handling.
  private mouseDown = false;

  constructor(w: number, h: number, initialX: number, initialY: number) {
    this.glcanvas = new GLCanvas(w, h, "#mapframe", this.onMouseEvent.bind(this));
    this.width = w;
    this.height = h;

    // Pixel coordinates of the top-left of the current view. Can never be negative.
    this.originX = initialX * CELL_SIZE;
    this.originY = initialY * CELL_SIZE;
  }

  private onMouseEvent(e: MouseEvent, type: GLCanvasMouseEventType) {
    if (type === "mousedown") {
      this.mouseDown = true;
    } else if (type === "mouseup") {
      this.mouseDown = false;
    } else if (this.mouseDown) {
    }
  }

  render() {
    // this.originX++;
    // this.originY++;
    this.drawTiles();
  }

  drawTiles() {
    // Row and column count to be rendered in the frame.
    const numCols = Math.ceil(this.width / CELL_SIZE);
    const numRows = Math.ceil(this.height / CELL_SIZE);

    // Whole cell offsets.
    const xCell = Math.floor(this.originX / CELL_SIZE);
    const yCell = Math.floor(this.originY / CELL_SIZE);

    // Fractional cell offsets.
    const xFrac = this.originX % CELL_SIZE;
    const yFrac = this.originY % CELL_SIZE;

    // Add an extra before and after for when we're showing part rows/cols.
    for (let row = -1; row < numRows + 1; row++) {
      for (let col = -1; col < numCols + 1; col++) {
        const x = col + xCell;
        const y = row + yCell;
        const tileId = Engine.world.getCell(x, y);

        // Optimization: if the tile is empty, just draw nothing.
        if (tileId === 0) {
          continue;
        }

        const tile = Engine.world.getTile(tileId);
        this.glcanvas.drawImage(tile.img, col * CELL_SIZE - xFrac, row * CELL_SIZE - yFrac, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
