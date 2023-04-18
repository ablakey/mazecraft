import texture from "./assets/textures/wolftextures.png";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "./config";
import { invLerp } from "./utils";

/**
 * The rendering engine for the Raycasting viewport.
 * Very heavily borrowed from this fantastic tutorial: https://lodev.org/cgtutor/raycasting.html
 */
export class Renderer {
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;
  private tex: HTMLImageElement;

  constructor() {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
    this.setResolution(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
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
      this.drawFloorSlice(y);
    }

    // for (let x = 0; x < this.width; x++) {
    //   this.drawColumn(x);
    // }

    // Perf experiment.
    const arr = new Uint8ClampedArray(this.width * this.height * 4);
    for (let x = 0; x < this.width * this.height; x++) {
      arr[x] = Math.random() * 255;
    }
    this.ctx.putImageData(new ImageData(arr, this.width, this.height), 0, 0);
    const t1 = performance.now();
  }

  private drawFloorSlice(y: number) {
    // rayDir for leftmost ray (x = 0) and rightmost ray (x = w)
    const { planeX, planeY, rotX, rotY, x: posX, y: posY } = Game.player;
    const rayDirX0 = rotX - planeX;
    const rayDirY0 = rotY - planeY;
    const rayDirX1 = rotX + planeX;
    const rayDirY1 = rotY + planeY;

    // Current y position compared to the center of the screen (the horizon)
    const p = y - this.height / 2;

    // Vertical position of the camera.
    const posZ = 0.5 * this.height;

    // Horizontal distance from the camera to the floor for the current row.
    // 0.5 is the z position exactly in the middle between floor and ceiling.
    const rowDistance = posZ / p;

    // calculate the real world step vector we have to add for each x (parallel to camera plane)
    // adding step by step avoids multiplications with a weight in the inner loop
    const floorStepX = (rowDistance * (rayDirX1 - rayDirX0)) / this.width;
    const floorStepY = (rowDistance * (rayDirY1 - rayDirY0)) / this.width;

    // real world coordinates of the leftmost column. This will be updated as we step to the right.
    let floorX = posX + rowDistance * rayDirX0;
    let floorY = posY + rowDistance * rayDirY0;

    for (let x = 0; x < this.width; x++) {
      // the cell coord is simply got from the integer parts of floorX and floorY
      const cellX = Math.floor(floorX);
      const cellY = Math.floor(floorY);

      // get the texture coordinate from the fractional part
      const tx = Math.floor((128 * (floorX - cellX)) & (128 - 1));
      const ty = Math.floor((128 * (floorY - cellY)) & (128 - 1));

      floorX += floorStepX;
      floorY += floorStepY;

      // choose texture and draw the pixel
      // const floorTexture = 3;
      // const ceilingTexture = 6;

      // floor
      // const color = texture[floorTexture][128 * ty + tx];
      // color = (color >> 1) & 8355711; // make a bit darker
      // buffer[y][x] = color;

      // const d = new ImageData(a, 1, 1);
      // this.ctx.putImageData(d, 100, 100);

      // //ceiling (symmetrical, at screenHeight - y - 1 instead of y)
      // color = texture[ceilingTexture][64 * ty + tx];
      // color = (color >> 1) & 8355711; // make a bit darker
      // buffer[screenHeight - y - 1][x] = color;
    }
  }

  private drawColumn(x: number) {
    // Position and direction of the casted ray.
    const screenX = (2 * x) / this.width - 1; // The x column of the screen.
    const rayDirX = Game.player.rotX + Game.player.planeX * screenX;
    const rayDirY = Game.player.rotY + Game.player.planeY * screenX;

    // Current map cell that the player is in. This mutates as we walk down the ray looking for a wall.
    let mapX = Math.floor(Game.player.x);
    let mapY = Math.floor(Game.player.y);

    // Length of ray for one map cell (x or y side)
    const deltaDistX = rayDirX === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirX);
    const deltaDistY = rayDirY === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirY);

    // Direction to step in x or y.
    const stepX = rayDirX < 0 ? -1 : 1;
    const stepY = rayDirY < 0 ? -1 : 1;

    // Length of initial segment of ray from player position to next. Mutates as we walk down the ray.
    let sideDistX = rayDirX < 0 ? Game.player.x - mapX : (mapX + 1.0 - Game.player.x) * deltaDistX;
    let sideDistY = rayDirY < 0 ? Game.player.y - mapY : (mapY + 1.0 - Game.player.y) * deltaDistY;

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
      cell = Game.world.getCell(mapX, mapY);

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
    const wallX = (!drawXWall ? Game.player.x + perpWallDist * rayDirX : Game.player.y + perpWallDist * rayDirY) % 1;

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
    // this.ctx.drawImage(texture, texX, 0, 1, 64, x, drawStart, 1, drawEnd - drawStart);

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

    // Draw the line to the canvas.
    // this.ctx.fillStyle = cell === 1 ? toHex([0, 0, Math.floor(255 * wallX)]) : "red";
    // this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);

    // console.log(x, wallX, texX);
  }
}
