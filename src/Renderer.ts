import texture from "./assets/wolftextures.png";

export class Renderer {
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;
  private tex: HTMLImageElement;

  constructor(settings: { screenWidth: number; screenHeight: number }) {
    this.width = settings.screenWidth;
    this.height = settings.screenHeight;

    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
  }

  async loadTextures() {
    return new Promise<void>((res) => {
      this.tex = new Image();
      this.tex.onload = () => {
        res();
        console.log(this.tex.width, this.tex.height);
      };
      this.tex.src = texture;
    });
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
    const rayDirX = game.player.rotX + game.player.planeX * screenX;
    const rayDirY = game.player.rotY + game.player.planeY * screenX;

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

    // Which side of a wall are we drawing? X? Otherwise Y.
    let drawXWall = false;

    // Extend the ray by one square until it hits a NS or EW wall.
    do {
      // Jump to the next map square, moving either y or x direction.
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        drawXWall = true;
        mapX += stepX;
      } else {
        drawXWall = false;
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

    // Calculate distance projected on camera direction. Are we drawing an X or a Y side of a wall?
    const perpWallDist = drawXWall ? sideDistX - deltaDistX : sideDistY - deltaDistY;

    // Height of the vertical column being drawn to the Renderer.
    const drawLineHeight = Math.floor(this.height / perpWallDist);

    // The start and end pixels of this column, clamped to not run outside the Renderer.
    const drawStart = Math.floor(Math.max(-drawLineHeight / 2 + this.height / 2, 0));
    const drawEnd = Math.floor(Math.min(drawLineHeight / 2 + this.height / 2, this.height - 1));

    // Where on the wall the ray hit (for determining what part of a texture to draw.
    // I think 0 would be the far left of the wall segment, 1 is the far right.
    const wallX = (!drawXWall ? game.player.x + perpWallDist * rayDirX : game.player.y + perpWallDist * rayDirY) % 1;

    const TEXTURE_WIDTH = 64;
    // X coordinate on the texture.
    let texX = Math.floor(wallX * TEXTURE_WIDTH);
    if ((drawXWall && rayDirX > 0) || (!drawXWall && rayDirY < 0)) {
      texX = TEXTURE_WIDTH - texX - 1;
    }

    /**
     * With the X texture value, we can take the entire slice of that texture and draw it to
     * a smaller vertical slice. All that math and affine transform is done for us by the canvas API.
     */
    this.ctx.drawImage(this.tex, texX, 0, 1, 64, x, drawStart, 1, drawEnd - drawStart);

    // Draw the line to the canvas.
    // this.ctx.fillStyle = cell === 1 ? toHex([0, 0, Math.floor(255 * wallX)]) : "red";
    // this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);

    // console.log(x, wallX, texX);
  }
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1].toString(16).padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}`;
}
