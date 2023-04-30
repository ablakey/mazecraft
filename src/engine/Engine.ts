import { Assets } from "./Assets";
import { GLCanvas } from "./GLCanvas";
import { Viewport } from "./Viewport";

const FPS = 60;

/**
 * Engine runs the ticking and rendering.
 */
export class Engine {
  assets: Assets;
  viewport: Viewport;
  // mapframe: MapFrame;
  mapframe: GLCanvas;
  now: number;
  lastTime: number;
  tickDelta: number;
  isRunning = true;

  // TODO: controls.

  constructor() {
    this.assets = new Assets();
    // this.viewport = new Viewport(640, 400);
    // this.mapframe = new MapFrame(800, 600);
    this.mapframe = new GLCanvas(800, 600, "#mapframe");
  }

  async init() {
    await this.assets.loadTextures();

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

    this.mapframe.drawImage(this.assets.textures.gravel, 100, 100);
    this.mapframe.drawImage(this.assets.textures.star, 200, 100);

    // TODO: advance the game by a tick.
    // game.player.moveForward();
    // Game.player.rotateRight();
    // this.viewport.drawFrame();

    // this.mapframe.draw();

    requestAnimationFrame(() => this.tick());
  }
}
