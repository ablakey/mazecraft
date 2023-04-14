const MOVE_SPEED = 0.1;

export class Player {
  x: number;
  y: number;
  rotX: number;
  rotY: number;

  constructor() {
    this.x = 25;
    this.y = 25;
    this.rotX = 1;
    this.rotY = 0;
  }

  moveForward() {
    const newX = this.x + this.rotX * MOVE_SPEED;
    const newY = this.y + this.rotY * MOVE_SPEED;

    if (!game.world.getCell(newX, newY)) {
      this.x = newX;
      this.y = newY;
    } else {
      console.log("collision!");
    }
  }
}
