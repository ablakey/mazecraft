import { Engine as EngineSingleton } from "./engine/Engine";

async function main() {
  window.Engine = new EngineSingleton();

  await Engine.init();
  Engine.start();
}

window.onload = main;

/**
 * Globals seem wrong but it's just really convenient given we're single-threaded and these are always-defined
 * singletons. It would make testing tricky, but I'm not planning on any.  It would make re-use tricky but I don't plan
 * on that. I'm leaving "World" as part of game because it will change as we load new worlds (aka. levels/floors).
 *
 * This can also make discovery difficult for people not familliar with the code. Ie. "where is game getting defined?"
 *
 * tl;dr: you probably don't want to do this in any sort of production code.
 */
declare global {
  const Engine: EngineSingleton;
  interface Window {
    Engine: EngineSingleton;
  }
}
