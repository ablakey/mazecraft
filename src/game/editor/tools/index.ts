import { TileId } from "../../../config";
import { Engine } from "../../Engine";
import { DrawTool } from "./DrawTool";
import { PanTool } from "./PanTool";

export abstract class EditorTool {
  protected engine: Engine;
  protected initialCanvasCoords: Vec2 | null;
  protected initialGridCoords: Vec2 | null;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  begin(initialCanvasCoords: Vec2, initialGridCoords: Vec2) {
    this.initialCanvasCoords = initialCanvasCoords;
    this.initialGridCoords = initialGridCoords;
  }

  abstract update(canvasCoords: Vec2, gridCoords: Vec2): void;

  end() {
    this.initialCanvasCoords = null;
    this.initialGridCoords = null;
  }

  getRenderCell?(coords: Vec2): TileId | undefined;
}

export type ToolName = (typeof PanTool | typeof DrawTool)["toolname"];
