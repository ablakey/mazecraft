import { Engine } from "../Engine";
import { GLCanvas } from "../../lib/GLCanvas";
import { EditorTool, ToolName } from "./tools";
import { PanTool } from "./tools/PanTool";
import { DrawTool } from "./tools/DrawTool";

const TILE_SIZE = 24;
const BORDER_SIZE = 1;
const CELL_SIZE = TILE_SIZE + BORDER_SIZE;

export class Editor {
  private engine: Engine;
  private glcanvas: GLCanvas;
  private canvasSize: Vec2; // width, height of canvas in pixels.
  private tools: Record<ToolName, EditorTool>;
  private currentTool: ToolName = "Draw";

  public origin: Vec2; // Pixel coordinates of the very top-left pixel.
  public selectedTile = 0; // if any editing is done, this is the selected tile to use.

  constructor(canvasSize: Vec2, engine: Engine) {
    this.engine = engine;
    this.glcanvas = new GLCanvas(canvasSize, "#Editor", this.onMouseEvent.bind(this));
    this.canvasSize = canvasSize;
    this.origin = [0, 0];

    this.tools = {
      Pan: new PanTool(this.engine),
      Draw: new DrawTool(this.engine),
    };
  }

  centerOn(coords: Vec2) {
    this.origin[0] = coords[0] * CELL_SIZE - Math.floor(this.canvasSize[0] / 2);
    this.origin[1] = coords[1] * CELL_SIZE - Math.floor(this.canvasSize[1] / 2);
  }

  private onMouseEvent(e: MouseEvent, type: "mousedown" | "mousemove" | "mouseup") {
    const tool = this.tools[this.currentTool];
    const canvasCoords: Vec2 = [e.offsetX, e.offsetY];
    const gridCoords: Vec2 = [
      Math.floor((e.offsetX + this.origin[0]) / CELL_SIZE),
      Math.floor((e.offsetY + this.origin[1]) / CELL_SIZE),
    ];

    if (type === "mousedown") {
      tool.begin(canvasCoords, gridCoords);
    } else if (type === "mouseup") {
      tool.end();
    } else {
      tool.update(canvasCoords, gridCoords);
    }
  }

  /**
   * Get a tile that's currently being edited. These are what the user are drawing in real-time, but haven't been
   * committed to the world state.
   *
   * Not sure if this is a good idea. It's an amazing effect when editing the world, but it might have implications
   * on any future AI and such.  Though I kind of want to deal with those things as well.  So we might want to abstract
   * the two sets of getTile into one that always overlays the editing tiles, if any, when being asked about the state
   * of the world.
   */
  getEditingTile(coords: Vec2) {
    return this.tools[this.currentTool].getRenderCell?.(coords);
  }

  render() {
    // this.originX++;
    // this.originY++;
    this.drawTiles();
  }

  drawTiles() {
    // Row and column count to be rendered in the frame.
    const numCols = Math.ceil(this.canvasSize[0] / CELL_SIZE);
    const numRows = Math.ceil(this.canvasSize[1] / CELL_SIZE);

    // Whole cell offsets.
    const xCell = Math.floor(this.origin[0] / CELL_SIZE);
    const yCell = Math.floor(this.origin[1] / CELL_SIZE);

    // Fractional cell offsets.
    const xFrac = this.origin[0] % CELL_SIZE;
    const yFrac = this.origin[1] % CELL_SIZE;

    // Add an extra before and after for when we're showing part rows/cols.
    for (let row = -1; row < numRows + 1; row++) {
      for (let col = -1; col < numCols + 1; col++) {
        const coords: Vec2 = [col + xCell, row + yCell];
        const tileId = this.tools[this.currentTool].getRenderCell?.(coords) ?? this.engine.world.get(coords);

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
