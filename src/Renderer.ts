import { World } from "./World";

// https://lodev.org/cgtutor/raycasting.html

const MOVE_SPEED = 0.05;

export class Renderer {
  width: number;
  height: number;
  posX: number;
  posY: number;
  dirX: number;
  dirY: number;
  planeX: number;
  planeY: number;
  world: World;

  private ctx: CanvasRenderingContext2D;

  constructor(world: World, settings: { screenWidth: number; screenHeight: number }) {
    this.width = settings.screenWidth;
    this.height = settings.screenHeight;
    this.world = world;

    this.posX = 25;
    this.posY = 25;
    this.dirX = 1;
    this.dirY = 0;
    this.planeX = 0;
    this.planeY = 0.66;

    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.imageSmoothingEnabled = false;
  }

  drawColumn(column: { color: string; drawStart: number; drawEnd: number; index: number }) {
    this.ctx.fillStyle = column.color;
    this.ctx.fillRect(column.index, column.drawStart, 1, column.drawEnd - column.drawStart);
  }

  clear() {
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  moveForward() {
    const newX = this.posX + this.dirX * MOVE_SPEED;
    const newY = this.posY + this.dirY * MOVE_SPEED;

    if (!this.collides(newX, newY)) {
      this.posX = newX;
      this.posY = newY;
    } else {
      console.log("collision!");
    }
  }

  collides(x: number, y: number) {
    return this.world.getCell(x, y) > 0;
  }

  drawFrame() {
    this.clear();
    for (let x = 0; x < this.width; x++) {
      const column = this.calculateColumn(x);
      this.drawColumn(column);
    }
  }

  private calculateColumn(x: number) {
    // Position and direction of the casted ray.
    const screenX = (2 * x) / this.width - 1; // The x column of the screen.
    const rayDirX = this.dirX + this.planeX * screenX;
    const rayDirY = this.dirY + this.planeY * screenX;

    // Current map cell that the player is in. This mutates as we walk down the ray looking for a wall.
    let mapX = Math.floor(this.posX);
    let mapY = Math.floor(this.posY);

    // Length of ray for one map cell (x or y side)
    const deltaDistX = rayDirX === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirX);
    const deltaDistY = rayDirY === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirY);

    //  Was it a N/S wall or an E/W wall? Mutates as we walk down the ray. Only the final result is correct.
    let side: "NS" | "EW";

    // Direction to step in x or y.
    const stepX = rayDirX < 0 ? -1 : 1;
    const stepY = rayDirY < 0 ? -1 : 1;

    // Length of initial segment of ray from player position to next. Mutates as we walk down the ray.
    let sideDistX = rayDirX < 0 ? this.posX - mapX : (mapX + 1.0 - this.posX) * deltaDistX;
    let sideDistY = rayDirY < 0 ? this.posY - mapY : (mapY + 1.0 - this.posY) * deltaDistY;

    // Was there a wall hit?
    let hit = false;

    let cell: number;

    // Extend the ray by one square until it hits a NS or EW wall.
    do {
      // Jump to the next map square, moving either y or x direction.
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = "EW";
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = "NS";
      }

      // Look up the map tile for this cell.
      cell = this.world.getCell(mapX, mapY);

      // Did we hit something given the map?
      if (cell > 0) {
        hit = true;
      }
    } while (!hit);

    // Calculate distance projected on camera direction (Euclidean distance would give fisheye effect!)
    const perpWallDist = side === "EW" ? sideDistX - deltaDistX : sideDistY - deltaDistY;

    // Height of the vertical column being drawn to the Renderer.
    const drawLineHeight = Math.floor(this.height / perpWallDist);

    // The start and end pixels of this column, clamped to not run outside the Renderer.
    const drawStart = Math.floor(Math.max(-drawLineHeight / 2 + this.height / 2, 0));
    const drawEnd = Math.floor(Math.min(drawLineHeight / 2 + this.height / 2, this.height - 1));

    return { drawStart, drawEnd, color: cell === 1 ? "blue" : "red", index: x };
  }
}
