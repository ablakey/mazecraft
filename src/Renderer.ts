export class Renderer {
  private width: number;
  private height: number;
  private planeX: number;
  private planeY: number;
  private ctx: CanvasRenderingContext2D;

  constructor(settings: { screenWidth: number; screenHeight: number }) {
    this.width = settings.screenWidth;
    this.height = settings.screenHeight;

    this.planeX = 0;
    this.planeY = 0.66;

    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
  }

  drawFrame() {
    // Clear the last frame.
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    for (let x = 0; x < this.width; x++) {
      this.drawColumn(x);
    }
  }

  private drawColumn(x: number) {
    // https://lodev.org/cgtutor/raycasting.html
    // Position and direction of the casted ray.
    const screenX = (2 * x) / this.width - 1; // The x column of the screen.
    const rayDirX = game.player.rotX + this.planeX * screenX;
    const rayDirY = game.player.rotY + this.planeY * screenX;

    // Current map cell that the player is in. This mutates as we walk down the ray looking for a wall.
    let mapX = Math.floor(game.player.x);
    let mapY = Math.floor(game.player.y);

    // Length of ray for one map cell (x or y side)
    const deltaDistX = rayDirX === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirX);
    const deltaDistY = rayDirY === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirY);

    // Direction to step in x or y.
    const stepX = rayDirX < 0 ? -1 : 1;
    const stepY = rayDirY < 0 ? -1 : 1;

    // Length of initial segment of ray from player position to next. Mutates as we walk down the ray.
    let sideDistX = rayDirX < 0 ? game.player.x - mapX : (mapX + 1.0 - game.player.x) * deltaDistX;
    let sideDistY = rayDirY < 0 ? game.player.y - mapY : (mapY + 1.0 - game.player.y) * deltaDistY;

    // Keep track of the cell we're raycasting through. If there's a hit, we break the loop and this is our cell.
    let cell: number;

    // Extend the ray by one square until it hits a NS or EW wall.
    do {
      // Jump to the next map square, moving either y or x direction.
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
      }

      // Look up the map tile for this cell.
      cell = game.world.getCell(mapX, mapY);

      // Did we hit something given the map?
      if (cell > 0) {
        break;
      }
    } while (true);

    // Calculate distance projected on camera direction (Euclidean distance would give fisheye effect!)
    const perpWallDist = sideDistX < sideDistY ? sideDistX - deltaDistX : sideDistY - deltaDistY;

    // Height of the vertical column being drawn to the Renderer.
    const drawLineHeight = Math.floor(this.height / perpWallDist);

    // The start and end pixels of this column, clamped to not run outside the Renderer.
    const drawStart = Math.floor(Math.max(-drawLineHeight / 2 + this.height / 2, 0));
    const drawEnd = Math.floor(Math.min(drawLineHeight / 2 + this.height / 2, this.height - 1));

    // Draw the line to the canvas.
    this.ctx.fillStyle = cell === 1 ? "blue" : "red";
    this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
  }
}
