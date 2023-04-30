import { GLCanvas } from "./GLCanvas";

const TILE_SIZE = 32;
const BORDER_SIZE = 1;
const CELL_SIZE = TILE_SIZE + BORDER_SIZE;

let offsetX = 0;
let offsetY = 0;

export class MapFrame {
  private width: number;
  private height: number;
  private glcanvas: GLCanvas;

  constructor(w: number, h: number) {
    this.glcanvas = new GLCanvas(w, h, "#mapframe");
    this.width = w;
    this.height = h;
  }

  draw() {
    offsetX -= 3.5;
    offsetY -= 3.5;
    this.drawCells();
  }

  drawCells() {
    const numCols = Math.ceil(this.width / CELL_SIZE);
    const numRows = Math.ceil(this.height / CELL_SIZE);

    for (let row = -1; row < numRows + 1; row++) {
      for (let col = -1; col < numCols + 1; col++) {
        const offX = offsetX % CELL_SIZE;
        const offY = offsetY % CELL_SIZE;

        this.drawCell(col * CELL_SIZE + offX, row * CELL_SIZE + offY);
      }
    }
  }

  drawCell(x: number, y: number) {
    const tex = Math.random() > 0.5 ? Engine.assets.textures.gravelSmall : Engine.assets.textures.wolftextures;
    this.glcanvas.drawImage(tex, x, y, 32, 32);
  }
}
