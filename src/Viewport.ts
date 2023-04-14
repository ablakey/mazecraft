export class Viewport {
  private ctx: CanvasRenderingContext2D;

  constructor() {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    canvas.width = 640;
    canvas.height = 400;
    this.ctx = canvas.getContext("2d")!;
  }

  render() {
    // TODO
  }
}
