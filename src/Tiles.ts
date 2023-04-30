import { TextureName } from "./assets/textures";
import { assert } from "./utils";

type Tile = {name:  TextureName}

const TILE_ATLAS = {
  0: {name: "gravel"}
} satisfies Record<number, Tile>;



export class Tiles {



  constructor() {
    Engine.assets.textures.
  }

  get(tileId: keyof typeof TILE_ATLAS) {
    const tile = TILE_ATLAS[tileId];
    assert(tileId);
  }
}
