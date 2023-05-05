import texture from "../assets/textures/wolftextures.png";
import { invLerp, lerp, toHex } from "../lib/utils";
import { Engine } from "./Engine";
type RGB = [number, number, number];
const SKY: RGB = [135, 206, 235];
const GROUND: RGB = [200, 200, 200];

/**
 * The rendering engine for the Raycasting viewport.
 * Very heavily borrowed from this fantastic tutorial: https://lodev.org/cgtutor/raycasting.html
 */
export class Viewport {
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;
  private tex: HTMLImageElement;
  private engine: Engine;

  constructor(w: number, h: number, engine: Engine) {
    this.engine = engine;
    const viewport = document.querySelector<HTMLCanvasElement>("#viewport")!;
    const canvas = document.createElement("canvas");
    viewport.appendChild(canvas);
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
    this.setResolution(w, h);
  }

  setResolution(w: number, h: number) {
    this.ctx.canvas.width = w;
    this.ctx.canvas.height = h;
    this.width = w;
    this.height = h;
  }

  async loadTextures() {
    return new Promise<void>((res) => {
      this.tex = new Image();
      this.tex.onload = () => {
        res();
      };
      this.tex.src = texture;
    });
  }

  drawFrame() {
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    for (let y = 0; y < this.height; y++) {
      this.drawBackgroundRow(y);
    }

    for (let x = 0; x < this.width; x++) {
      this.drawColumn(x);
    }
  }

  private drawBackgroundRow(y: number) {
    const halfHeight = this.height / 2;
    if (y < halfHeight) {
      this.ctx.fillStyle = toHex(SKY);
    } else {
      const pct = (y - halfHeight) / halfHeight;
      const color = GROUND.map((g) => Math.floor(lerp(0, g, pct))) as RGB;
      this.ctx.fillStyle = toHex(color);
    }
    this.ctx.fillRect(0, y, this.width, 1);
  }

  private drawColumn(x: number) {
    const player = this.engine.player;

    // Position and direction of the casted ray.
    const screenX = (2 * x) / this.width - 1; // The x column of the screen.
    const rayDirX = player.rotX + player.planeX * screenX;
    const rayDirY = player.rotY + player.planeY * screenX;

    // Current map cell that the player is in. This mutates as we walk down the ray looking for a wall.
    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);

    // Length of ray for one map cell (x or y side)
    const deltaDistX = rayDirX === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirX);
    const deltaDistY = rayDirY === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirY);

    // Direction to step in x or y.
    const stepX = rayDirX < 0 ? -1 : 1;
    const stepY = rayDirY < 0 ? -1 : 1;

    // Length of initial segment of ray from player position to next. Mutates as we walk down the ray.
    let sideDistX = rayDirX < 0 ? player.x - mapX : (mapX + 1.0 - player.x) * deltaDistX;
    let sideDistY = rayDirY < 0 ? player.y - mapY : (mapY + 1.0 - player.y) * deltaDistY;

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
      cell = this.engine.world.getCell(mapX, mapY);

      // Did we hit something given the map?
      if (cell > 0) {
        break;
      }
    } while (true);

    // Calculate distance projected on camera direction. Are we drawing an X or a Y side of a wall?
    const perpWallDist = drawXWall ? sideDistX - deltaDistX : sideDistY - deltaDistY;

    // Height of the vertical column being drawn to the Viewport.
    const drawLineHeight = Math.floor(this.height / perpWallDist);

    // The start and end pixels of this column, clamped to not run outside the Viewport.
    const drawStart = Math.floor(Math.max(-drawLineHeight / 2 + this.height / 2, 0));
    const drawEnd = Math.floor(Math.min(drawLineHeight / 2 + this.height / 2, this.height - 1));

    // Where on the wall the ray hit (for determining what part of a texture to draw.
    // I think 0 would be the far left of the wall segment, 1 is the far right.
    const wallX = (!drawXWall ? player.x + perpWallDist * rayDirX : player.y + perpWallDist * rayDirY) % 1;

    const texture = this.engine.assets.textures.Gravel;

    // X coordinate on the texture.
    let texX = Math.floor(wallX * texture.width);
    if ((drawXWall && rayDirX > 0) || (!drawXWall && rayDirY < 0)) {
      texX = texture.width - texX - 1;
    }

    /**
     * With the X texture value, we can take the entire slice of that texture and draw it to
     * a smaller vertical slice. All that math and affine transform is done for us by the canvas API.
     */
    this.ctx.drawImage(texture, texX, 0, 1, texture.width, x, drawStart, 1, drawEnd - drawStart);

    /**
     * Some basic fog experiment. The further away, the darker, given some clamped min and max.
     * This doesn't (yet) handle floor and ceiling so the effect doesn't work.
     */
    const distance = Math.min(sideDistX, sideDistY);
    const MIN_FOG_DISTANCE = 5.0;
    const MAX_FOG_DISTANCE = 10;
    if (distance > MIN_FOG_DISTANCE) {
      const pct = invLerp(MIN_FOG_DISTANCE, MAX_FOG_DISTANCE, distance);
      this.ctx.fillStyle = `rgb(0,0,0, ${pct})`;
      this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
    }
  }
}
