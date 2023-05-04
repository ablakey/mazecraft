import { Engine } from "./Engine";
import { GLCanvas } from "./GLCanvas";

type MapFrameEvent =
  | {
      type: "mousemove";
      frameX: number;
      frameY: number;
    }
  | {
      type: "mousedown";
    }
  | {
      type: "mouseup";
    };

const TILE_SIZE = 24;
const BORDER_SIZE = 1;
const CELL_SIZE = TILE_SIZE + BORDER_SIZE;

export class MapFrame {
  private engine: Engine;
  private width: number;
  private height: number;

  // Pixel coordinates of the very top-left pixel.
  private origin: [number, number];

  private glcanvas: GLCanvas;

  // MapFrame coordinates when mouse was held down.
  private mouseDownCoords: [number, number] | null = null;

  // Origin coordinates when mouse was held down.
  private mouseDownOrigin: [number, number] | null = null;

  private interaction = "Pan";

  constructor(w: number, h: number, initialX: number, initialY: number, engine: Engine) {
    this.engine = engine;
    this.glcanvas = new GLCanvas(w, h, "#mapframe", this.onMouseEvent.bind(this));
    this.width = w;
    this.height = h;

    this.origin = [initialX * CELL_SIZE, initialY * CELL_SIZE];
  }

  private onMouseEvent(e: MouseEvent, type: MapFrameEvent["type"]) {
    // const mapX = Math.floor((e.offsetX + this.originX) / CELL_SIZE);
    // const mapY = Math.floor((e.offsetY + this.originY) / CELL_SIZE);

    if (type === "mousedown") {
      this.mouseDownCoords = [e.offsetX, e.offsetY];
      this.mouseDownOrigin = [...this.origin];
    } else if (type === "mouseup") {
      this.mouseDownCoords = null;
      this.mouseDownOrigin = null;
    } else if (this.mouseDownCoords) {
      const deltaX = e.offsetX - this.mouseDownCoords[0];
      const deltaY = e.offsetY - this.mouseDownCoords[1];
      this.origin = [this.mouseDownOrigin![0] - deltaX, this.mouseDownOrigin![1] - deltaY];
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
    const xCell = Math.floor(this.origin[0] / CELL_SIZE);
    const yCell = Math.floor(this.origin[1] / CELL_SIZE);

    // Fractional cell offsets.
    const xFrac = this.origin[0] % CELL_SIZE;
    const yFrac = this.origin[1] % CELL_SIZE;

    // Add an extra before and after for when we're showing part rows/cols.
    for (let row = -1; row < numRows + 1; row++) {
      for (let col = -1; col < numCols + 1; col++) {
        const x = col + xCell;
        const y = row + yCell;
        const tileId = this.engine.world.getCell(x, y);

        // Optimization: if the tile is empty, just draw nothing.
        if (tileId === 0) {
          continue;
        }

        const tile = this.engine.world.getTile(tileId);
        this.glcanvas.drawImage(tile.img, col * CELL_SIZE - xFrac, row * CELL_SIZE - yFrac, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
