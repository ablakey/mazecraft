const TILE_SIZE = 32;
const BORDER_SIZE = 1;
const CELL_SIZE = TILE_SIZE + BORDER_SIZE;

const offsetX = 0;
const offsetY = 0;

export class MapFrame {
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;

  constructor(w: number, h: number) {
    const viewport = document.querySelector<HTMLCanvasElement>("#mapframe")!;
    const canvas = document.createElement("canvas");
    viewport.appendChild(canvas);
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.canvas.width = w;
    this.ctx.canvas.height = h;
    this.width = w;
    this.height = h;
  }

  draw() {
    // offsetX--;
    // offsetY--;
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.drawCells();
  }

  drawCells() {
    const numCols = Math.ceil(this.width / CELL_SIZE);
    const numRows = Math.ceil(this.height / CELL_SIZE);

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const offX = offsetX % CELL_SIZE;
        const offY = offsetY % CELL_SIZE;

        this.drawCell(col * CELL_SIZE + offX, row * CELL_SIZE + offY);
      }
    }
  }

  drawCell(x: number, y: number) {
    const tex = Engine.assets.textures.gravelSmall;
    this.ctx.drawImage(tex, x, y);
  }
}
