import { Assets } from "./Assets";
import { GLMapFrame } from "./GLMapFrame";
import { MapFrame } from "./MapFrame";
import { Viewport } from "./Viewport";

const FPS = 60;

/**
 * Engine runs the ticking and rendering.
 */
export class Engine {
  assets: Assets;
  viewport: Viewport;
  // mapframe: MapFrame;
  mapframe: GLMapFrame;
  now: number;
  lastTime: number;
  tickDelta: number;
  isRunning = true;

  // TODO: controls.

  constructor() {
    this.assets = new Assets();
    // this.viewport = new Viewport(640, 400);
    // this.mapframe = new MapFrame(800, 600);
    this.mapframe = new GLMapFrame();
  }

  async init() {
    await this.assets.loadTextures();

    this.now = 0;
    this.lastTime = 0;
    this.tickDelta = 0;
    // this.tick();

    this.mapframe.start(800, 600);
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

    // this.mapframe.draw();

    requestAnimationFrame(() => this.tick());
  }
}
