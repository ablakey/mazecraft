import { Renderer } from "./Renderer";
import { World } from "./World";

// Until it gets too big, this is the engine.
function main() {
  const world = new World();
  const renderer = new Renderer(world, { screenWidth: 640, screenHeight: 400 });
  setInterval(() => {
    renderer.moveForward();
    renderer.drawFrame();
  }, 100);
}

window.onload = main;
