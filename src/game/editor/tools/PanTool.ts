import { EditorTool } from ".";
import { assert } from "../../../lib/utils";

export class PanTool extends EditorTool {
  static readonly toolname = "Pan";
  private initialOrigin: Vec2 | null = null;
  private initialCanvasCoords: Vec2 | null = null;
  private isPanning = false;

  begin(canvasCoords: Vec2) {
    this.initialOrigin = [...this.engine.editor.origin];
    this.initialCanvasCoords = canvasCoords;
  }

  update(coords: Vec2) {
    // Panning has no update effect if there hasn't been a mousedown yet.
    if (!this.isPanning) {
      return;
    }

    assert(this.initialCanvasCoords);
    assert(this.initialOrigin);

    const deltaX = coords[0] - this.initialCanvasCoords[0];
    const deltaY = coords[1] - this.initialCanvasCoords[1];
    this.engine.editor.origin = [this.initialOrigin[0] - deltaX, this.initialOrigin[1] - deltaY];
  }

  end(): void {
    this.initialOrigin = null;
    this.isPanning = false;
    this.initialCanvasCoords = null;
  }
}
