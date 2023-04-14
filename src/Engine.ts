import { Viewport } from "./Viewport";

type Vec = [number, number];

// https://lodev.org/cgtutor/raycasting.html

const MAP_WIDTH = 10;

const map = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 3, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0,
  0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1,
];

export class Engine {
  width: number;
  height: number;
  viewport: Viewport;
  pos: Vec;
  dir: Vec;
  plane: Vec;

  constructor() {
    this.width = 320;
    this.height = 200;
    this.viewport = new Viewport();

    this.pos = [5, 5];
    this.dir = [1, 1];
    this.plane = [0, 0.66]; // Camera plane.
  }

  rotate(theta: number) {
    const newX = this.dir[0] * Math.cos(theta) - this.dir[1] * Math.sin(theta);
    const newY = this.dir[0] * Math.sin(theta) + this.dir[1] * Math.cos(theta);
    this.dir = [newX, newY];
  }

  tick() {
    this.viewport.clear();
    for (let x = 0; x < this.width; x++) {
      const column = this.calculateColumn(x);
      this.viewport.drawColumn(column);
    }
  }

  private calculateColumn(x: number) {
    // Position and direction of the casted ray.
    const screenX = (2 * x) / this.width - 1; // The x column of the screen.
    const rayDirX = this.dir[0] + this.plane[0] * screenX;
    const rayDirY = this.dir[1] + this.plane[1] * screenX;

    // Current map cell that the player is in. This mutates as we walk down the ray looking for a wall.
    let mapX = this.pos[0];
    let mapY = this.pos[1];

    // Length of ray for one map cell (x or y side)
    const deltaDistX = rayDirX === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirX);
    const deltaDistY = rayDirY === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / rayDirY);

    //  Was it a N/S wall or an E/W wall? Mutates as we walk down the ray. Only the final result is correct.
    let side: "NS" | "EW";

    // Direction to step in x or y.
    const stepX = rayDirX < 0 ? -1 : 1;
    const stepY = rayDirY < 0 ? -1 : 1;

    // Length of initial segment of ray from player position to next. Mutates as we walk down the ray.
    let sideDistX = rayDirX < 0 ? this.pos[0] - mapX : (mapX + 1.0 - this.pos[0]) * deltaDistX;
    let sideDistY = rayDirY < 0 ? this.pos[1] - mapY : (mapY + 1.0 - this.pos[1]) * deltaDistY;

    // Was there a wall hit?
    let hit = false;

    let mapTile: number;

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
      mapTile = map[mapY * MAP_WIDTH + mapX];

      // Did we hit something given the map?
      if (mapTile > 0) {
        hit = true;
      }
    } while (!hit);

    // Calculate distance projected on camera direction (Euclidean distance would give fisheye effect!)
    const perpWallDist = side === "EW" ? sideDistX - deltaDistX : sideDistY - deltaDistY;

    // Height of the vertical column being drawn to the viewport.
    const drawLineHeight = Math.abs(this.height / perpWallDist);

    // The start and end pixels of this column, clamped to not run outside the viewport.
    const drawStart = Math.max(-drawLineHeight / 2 + this.height / 2, 0);
    const drawEnd = Math.min(drawLineHeight / 2 + this.height / 2, this.height - 1);

    return { drawStart, drawEnd, color: mapTile === 1 ? "blue" : "red", index: x };
  }
}
