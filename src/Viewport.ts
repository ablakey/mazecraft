export class Viewport {
  private ctx: CanvasRenderingContext2D;

  constructor() {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    canvas.width = 320;
    canvas.height = 200;
    this.ctx = canvas.getContext("2d")!;
  }

  drawColumn(column: { color: string; drawStart: number; drawEnd: number; index: number }) {
    this.ctx.fillStyle = column.color;
    this.ctx.fillRect(column.index, column.drawStart, 1, column.drawEnd);
  }

  clear() {
    this.ctx.clearRect(0, 0, 320, 200);
  }
}
