import { Engine } from "../Engine";
import { GLCanvas } from "../GLCanvas";
import { DrawTool, EditorTool, PanTool, ToolName } from "./tools";

const TILE_SIZE = 24;
const BORDER_SIZE = 1;
const CELL_SIZE = TILE_SIZE + BORDER_SIZE;

export class Editor {
  private engine: Engine;
  private width: number;
  private height: number;

  // Pixel coordinates of the very top-left pixel.
  public origin: Vec2;

  private glcanvas: GLCanvas;

  private currentTool: ToolName = "Pan";

  private tools: Record<ToolName, EditorTool>;

  constructor(w: number, h: number, initialX: number, initialY: number, engine: Engine) {
    this.engine = engine;
    this.glcanvas = new GLCanvas(w, h, "#Editor", this.onMouseEvent.bind(this));
    this.width = w;
    this.height = h;

    this.origin = [initialX * CELL_SIZE, initialY * CELL_SIZE];

    this.tools = {
      Pan: new PanTool(this.engine),
      Draw: new DrawTool(this.engine),
    };
  }

  private onMouseEvent(e: MouseEvent, type: "mousedown" | "mousemove" | "mouseup") {
    const tool = this.tools[this.currentTool];

    if (type === "mousedown") {
      tool.begin([e.offsetX, e.offsetY]);
    } else if (type === "mouseup") {
      tool.end();
    } else {
      tool.update([e.offsetX, e.offsetY]);
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
