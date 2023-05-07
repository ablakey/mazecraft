import { Engine } from "../../Engine";
import { DrawTool } from "./DrawTool";
import { PanTool } from "./PanTool";

export abstract class EditorTool {
  protected engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  abstract begin(canvasCoords: Vec2, gridCoords: Vec2): void;
  abstract update(canvasCoords: Vec2, gridCoords: Vec2): void;
  abstract end(): void;

  // Can't be abstract if it's optional. I dunno either.
  getRenderCell?(coords: Vec2): number | undefined;
}

export type ToolName = (typeof PanTool | typeof DrawTool)["toolname"];
