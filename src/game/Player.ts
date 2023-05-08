const MOVE_SPEED = 0.1;
const ROT_SPEED = 0.01;
export class Player {
  position: Vec2;
  rotX: number;
  rotY: number;

  // Can't we just calculate this each time?
  planeX: number;
  planeY: number;

  constructor() {
    this.position = [0, 0];
    this.rotX = 1;
    this.rotY = 0;
    this.planeX = 0;
    this.planeY = 0.66;
  }

  /**
   * Return coordinates of the tile the player is in.
   */
  get tilePosition(): Vec2 {
    return [Math.floor(this.position[0]), Math.floor(this.position[1])];
  }

  // moveForward() {
  //   const newPos: Vec2 = [this.x + this.rotX * MOVE_SPEED, this.y + this.rotY * MOVE_SPEED];

  //   if (!Engine.world.get(newPos)) {
  //     this.x = newPos[0];
  //     this.y = newPos[1];
  //   } else {
  //     console.log("collision!");
  //   }
  // }

  rotateLeft() {
    // TODO: generic rotate with a direction argument.
    const oldDirX = this.rotX;
    this.rotX = this.rotX * Math.cos(-ROT_SPEED) - this.rotY * Math.sin(-ROT_SPEED);
    this.rotY = oldDirX * Math.sin(-ROT_SPEED) + this.rotY * Math.cos(-ROT_SPEED);

    const oldPlaneX = this.planeX;
    this.planeX = this.planeX * Math.cos(-ROT_SPEED) - this.planeY * Math.sin(-ROT_SPEED);
    this.planeY = oldPlaneX * Math.sin(-ROT_SPEED) + this.planeY * Math.cos(-ROT_SPEED);
  }
}
