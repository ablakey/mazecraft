import { Player } from "./Player";
import { World } from "./World";

export class Game {
  world: World;
  player: Player;

  constructor() {
    this.world = new World();
    this.player = new Player();
  }
}
