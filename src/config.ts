import { Tile } from "./game/World";

// Max dimensions for the world (in tiles). Important for being able to index a row-major array.
// Also important for some optimizations and constraints.
export const MAX_TILE_DIMENSIONS: Vec2 = [10_000, 10_000];

export const TILE_CONFIGS = {
  0: { name: "Empty", type: "Wall" },
  1: { name: "Gravel", type: "Wall" },
} satisfies Record<number, Omit<Tile, "img">>; // `img` is assigned at runtime once cached.

export type TileId = keyof typeof TILE_CONFIGS;
