import { TextureName } from "../assets/textures";
import { MAX_TILE_DIMENSIONS, TILE_CONFIGS, TileId } from "../config";
import { Grid } from "../lib/Grid";
import { assert } from "../lib/utils";

export type TileName = TextureName | "Empty";
export type Tile = { name: TileName; img: HTMLImageElement; type: "Wall" | "Doodad" | "Item" };

export class World {
  // A sparse array with a known max width/height so that we may easily access any specific row.
  private grid: Grid<TileId>;
  private atlas: Record<number, Tile> = {};
  private defaultTile: TileId = 1; // TODO: weird if static.

  constructor() {
    this.grid = new Grid(MAX_TILE_DIMENSIONS);
  }

  prepareTiles() {
    // Look up loaded images and bind them to the atlas.
    this.atlas = Object.fromEntries(
      Object.entries(TILE_CONFIGS).map(([id, config]) => [id, { ...config, img: Engine.assets.textures[config.name] }])
    ) as typeof this.atlas;
  }

  getTile(tileId: TileId): Tile {
    const tile = this.atlas[tileId];
    assert(tile, `lookup tile id: ${tileId}`);
    return tile;
  }

  getCell(coords: Vec2): TileId {
    return this.grid.get(coords) ?? this.defaultTile;
  }

  setCell(coords: Vec2, value: TileId) {
    this.grid.set(coords, value);
  }
}
