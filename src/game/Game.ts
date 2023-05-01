import { Tiles } from "./Tiles";
import { Player } from "./Player";
import { World } from "./World";

/**
 * Game state.
 */
export class Game {
  world: World;
  player: Player;
  tiles: Tiles;

  constructor() {
    this.tiles = new Tiles();
    this.player = new Player();
    this.world = new World();
  }

  init() {
    this.tiles.prepareTiles();
  }
}
