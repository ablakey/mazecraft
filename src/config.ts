import { Tile } from "./game/World";

// Max dimensions for the world (in tiles). Maybe not necessary.
export const MAX_WIDTH = 10_000;
export const MAX_HEIGHT = 10_000;

export const TILE_CONFIGS = {
  0: { name: "Empty", type: "Wall" },
  1: { name: "Gravel", type: "Wall" },
} satisfies Record<number, Omit<Tile, "img">>; // `img` is assigned at runtime once cached.
