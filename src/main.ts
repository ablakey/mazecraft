import { Engine as EngineSingleton } from "./engine/Engine";
import { Game as GameSingleton } from "./game/Game";

// Until it gets too big, this is the engine.
async function main() {
  window.Engine = new EngineSingleton();
  window.Game = new GameSingleton();

  await Engine.init();
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
  const Game: GameSingleton;
  const Engine: EngineSingleton;
  interface Window {
    Game: GameSingleton;
    Engine: EngineSingleton;
  }
}
