import { TextureName } from "../assets/textures";
import { MAX_HEIGHT, MAX_WIDTH, TILE_CONFIGS } from "../config";
import { assert } from "../lib/utils";

export type TileName = TextureName | "Empty";
export type Tile = { name: TileName; img: HTMLImageElement; type: "Wall" | "Doodad" | "Item" };

export class World {
  // A sparse array with a known max width/height so that we may easily access any specific row.
  private cells: number[] = new Array(MAX_WIDTH * MAX_HEIGHT);
  private atlas: Record<number, Tile> = {};
  private defaultTile = 1; // TODO: is this a constant?

  constructor() {
    // generate a box. (TODO: Proof of concept)
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        if (x === 0 || y === 0 || x === 20 - 1 || y === 20 - 1) {
          this.setCell(x, y, 1);
        } else if (Math.random() > 0.95) {
          this.setCell(x, y, 1);
          // Generate some random things on the map for demo purposes.
        }
      }
    }
  }

  prepareTiles() {
    // Look up loaded images and bind them to the atlas.
    this.atlas = Object.fromEntries(
      Object.entries(TILE_CONFIGS).map(([id, config]) => [id, { ...config, img: Engine.assets.textures[config.name] }])
    ) as typeof this.atlas;
  }

  getTile(tileId: number): Tile {
    const tile = this.atlas[tileId];
    assert(tile, `lookup tile id: ${tileId}`);
    return tile;
  }

  getCell(x: number, y: number): number {
    // TODO: error if looking outside the width or height.
    return this.cells[y * MAX_WIDTH + x] ?? Engine.world.defaultTile;
  }

  setCell(x: number, y: number, value: number) {
    this.cells[y * MAX_WIDTH + x] = value;
  }
}
