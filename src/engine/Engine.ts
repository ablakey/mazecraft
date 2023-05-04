import { Player } from "./Player";
import { World } from "./World";
import { Assets } from "./Assets";
import { MapFrame } from "./MapFrame";
import { Viewport } from "./Viewport";
import { MAX_HEIGHT, MAX_WIDTH } from "../config";

const FPS = 60;

/**
 * Engine runs the ticking and rendering.
 */
export class Engine {
  assets: Assets;
  viewport: Viewport;
  mapframe: MapFrame;
  world: World;
  player: Player;

  now: number;
  lastTime: number;
  tickDelta: number;
  isRunning = true;

  // TODO: controls.

  constructor() {
    this.assets = new Assets();
    // this.viewport = new Viewport(640, 400);
    // Begin at the middle of the World to make editing in any direction easy.
    this.mapframe = new MapFrame(800, 600, MAX_WIDTH / 2, MAX_HEIGHT / 2, this);

    this.player = new Player();
    this.world = new World();
  }

  async init() {
    await this.assets.loadTextures();
    await this.world.prepareTiles();
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
    // Game.player.rotateRight();
    // this.viewport.drawFrame();

    this.mapframe.render();

    requestAnimationFrame(() => this.tick());
  }
}
