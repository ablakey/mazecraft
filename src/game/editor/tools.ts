import { Engine } from "../Engine";

export abstract class EditorTool {
  protected engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  abstract begin(initialCoords: Vec2): void;
  abstract update(coords: Vec2): void;
  abstract end(): void;
  abstract getRenderTiles(): void;
}

export class PanTool extends EditorTool {
  static readonly toolname = "Pan";
  private initialCoords: Vec2 | null = null;
  private initialOrigin: Vec2 | null = null;

  begin(initialCoords: Vec2) {
    this.initialCoords = initialCoords;
    this.initialOrigin = [...this.engine.editor.origin];
  }

  update(coords: Vec2) {
    // Panning has no update effect if there hasn't been a mousedown yet.
    if (this.initialCoords === null || this.initialOrigin === null) {
      return;
    }

    const deltaX = coords[0] - this.initialCoords[0];
    const deltaY = coords[1] - this.initialCoords[1];
    this.engine.editor.origin = [this.initialOrigin[0] - deltaX, this.initialOrigin[1] - deltaY];
  }

  getRenderTiles(): void {}

  end(): void {
    this.initialCoords = null;
    this.initialOrigin = null;
  }
}

export class DrawTool extends EditorTool {
  static readonly toolname = "Draw";
  private initialCoords: Vec2;

  begin(initialCoords: Vec2) {
    this.initialCoords = initialCoords;
  }

  update(coords: Vec2) {}

  getRenderTiles(): void {}

  end(): void {}
}

export type ToolName = (typeof PanTool | typeof DrawTool)["toolname"];
