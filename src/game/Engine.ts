import { MAX_TILE_DIMENSIONS } from "../config";
import { Assets } from "./Assets";
import { Player } from "./Player";
import { Viewport } from "./Viewport";
import { World } from "./World";
import { Editor } from "./editor/Editor";

const FPS = 60;

/**
 * Engine runs the ticking and rendering.
 */
export class Engine {
  assets: Assets;
  viewport: Viewport;
  editor: Editor;
  world: World;
  player: Player;

  now: number;
  lastTime: number;
  tickDelta: number;
  isRunning = true;

  // TODO: controls.

  constructor() {
    this.assets = new Assets();
    this.viewport = new Viewport([640, 480], this);
    // Begin at the middle of the World to make editing in any direction easy.
    this.editor = new Editor([800, 600], this);

    this.player = new Player();
    this.world = new World(MAX_TILE_DIMENSIONS);
  }

  async init() {
    await this.assets.loadTextures();
    await this.world.prepareTiles();

    // Locate player (middle of a cell)
    const pos: Vec2 = [MAX_TILE_DIMENSIONS[0] / 2, MAX_TILE_DIMENSIONS[1] / 2];
    this.player.position = [pos[0] + 0.5, pos[1] + 0.5];
    this.editor.centerOn(this.player.tilePosition);

    this.world.set(pos, 0);
    this.world.set([pos[0] - 1, pos[1]], 0);
    this.world.set([pos[0] + 1, pos[1]], 0);

    this.world.set([pos[0], pos[1] - 1], 0);
    this.world.set([pos[0] - 1, pos[1] - 1], 0);
    this.world.set([pos[0] + 1, pos[1] - 1], 0);

    this.world.set([pos[0], pos[1] + 1], 0);
    this.world.set([pos[0] - 1, pos[1] + 1], 0);
    this.world.set([pos[0] + 1, pos[1] + 1], 0);

    this.world.set([pos[0] + 2, pos[1]], 0);
  }

  play() {
    this.now = 0;
    this.lastTime = 0;
    this.tickDelta = 0;
    this.tick();
  }

  private tick() {
    this.now = performance.now();
    const deltaTime = this.now - this.lastTime;
    this.tickDelta += deltaTime;
    this.lastTime = this.now;

    // A frame has elapsed.
    if (this.tickDelta > 1000 / FPS && this.isRunning) {
      this.tickDelta = 0;
    }

    // TODO: advance the game by a tick.
    // game.player.moveForward();
    // this.player.rotateLeft();
    this.viewport.drawFrame();

    this.editor.render();

    requestAnimationFrame(() => this.tick());
  }
}
