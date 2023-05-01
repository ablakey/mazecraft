import { TextureName } from "../assets/textures";
import { assert } from "../utils";

type TileName = TextureName | "Empty";

type TileConfig = { name: TileName };
type Tile = TileConfig & { img: HTMLImageElement };

const TILE_CONFIGS = {
  0: { name: "Empty" },
  1: { name: "Gravel" },
} satisfies Record<number, TileConfig>;

export class Tiles {
  atlas: Record<number, Tile> = {};
  defaultTile = 1;

  prepareTiles() {
    // Look up loaded images and bind them to the atlas.
    this.atlas = Object.fromEntries(
      Object.entries(TILE_CONFIGS).map(([id, config]) => [id, { ...config, img: Engine.assets.textures[config.name] }])
    ) as typeof this.atlas;
  }

  get(tileId: number): Tile {
    const tile = this.atlas[tileId];
    assert(tile, `lookup tile id: ${tileId}`);
    return tile;
  }
}
