import { GLCanvas } from "./GLCanvas";

const TILE_SIZE = 24;
const BORDER_SIZE = 1;
const CELL_SIZE = TILE_SIZE + BORDER_SIZE;

export class MapFrame {
  private width: number;
  private height: number;
  private glcanvas: GLCanvas;

  constructor(w: number, h: number) {
    this.glcanvas = new GLCanvas(w, h, "#mapframe");
    this.width = w;
    this.height = h;
  }

  render() {
    this.drawTiles();
  }

  drawTiles() {
    const numCols = Math.ceil(this.width / CELL_SIZE);
    const numRows = Math.ceil(this.height / CELL_SIZE);

    for (let row = -1; row < numRows + 1; row++) {
      for (let col = -1; col < numCols + 1; col++) {
        this.drawTile(col * CELL_SIZE, row * CELL_SIZE);
      }
    }
  }

  drawTile(x: number, y: number) {
    const tex = Engine.assets.textures.gravel;
    this.glcanvas.drawImage(tex, x, y, TILE_SIZE, TILE_SIZE);
  }
}
