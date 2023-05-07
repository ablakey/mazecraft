import { Tile } from "./game/World";

// Max dimensions for the world (in tiles). Important for being able to index a row-major array.
export const MAX_TILE_DIMENSIONS: Vec2 = [10_000, 10_000];

export const TILE_CONFIGS = [
  { label: "Empty", type: "Wall", imgName: "empty" },
  { label: "Gravel", type: "Wall", imgName: "gravel" },
] satisfies Array<Omit<Tile, "img">>;
