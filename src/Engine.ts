const FPS = 60;

export class Engine {
  now: number;
  lastTime: number;
  tickDelta: number;
  isRunning = true;

  // TODO: controls.

  start() {
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
    game.player.rotateRight();

    renderer.drawFrame();

    requestAnimationFrame(() => this.tick());
  }
}
