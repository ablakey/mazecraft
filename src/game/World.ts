import { TextureName } from "../assets/textures";
import { TILE_CONFIGS } from "../config";
import { Grid } from "../lib/Grid";
import { assert } from "../lib/utils";

export type Tile = { label: string; imgName: TextureName; img: HTMLImageElement; type: "Wall" | "Doodad" | "Item" };

export class World extends Grid {
  // A sparse array with a known max width/height so that we may easily access any specific row.
  private atlas: Record<number, Tile>;
  private defaultTile = 1; // TODO: weird if static.

  prepareTiles() {
    // Look up loaded images and bind them to the atlas.
    this.atlas = Object.fromEntries(
      TILE_CONFIGS.map((config, id) => [id as number, { ...config, img: Engine.assets.textures[config.imgName] }])
    ) as typeof this.atlas;
  }

  getTile(tileId: number): Tile {
    const tile = this.atlas[tileId];
    assert(tile, `lookup tile id: ${tileId}`);
    return tile;
  }

  get(coords: Vec2) {
    return super.get(coords) ?? this.defaultTile;
  }
}
