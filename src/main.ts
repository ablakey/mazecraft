import { Engine } from "./Engine";

function main() {
  const engine = new Engine();
  setInterval(() => {
    engine.rotate(-0.1);
    engine.tick();
  }, 100);
}

window.onload = main;
