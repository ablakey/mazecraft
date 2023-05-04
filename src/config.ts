import { TileConfig } from "./game/World";

// Max dimensions for the world (in tiles). Maybe not necessary.
export const MAX_WIDTH = 10_000;
export const MAX_HEIGHT = 10_000;

export const TILE_CONFIGS = {
  0: { name: "Empty" },
  1: { name: "Gravel" },
} satisfies Record<number, TileConfig>;
