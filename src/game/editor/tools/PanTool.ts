import { EditorTool } from ".";

export class PanTool extends EditorTool {
  static readonly toolname = "Pan";
  private initialOrigin: Vec2 | null = null;

  begin(initialCanvasCoords: Vec2, initialGridCoords: Vec2) {
    super.begin(initialCanvasCoords, initialGridCoords);
    this.initialOrigin = [...this.engine.editor.origin];
  }

  update(coords: Vec2) {
    // Panning has no update effect if there hasn't been a mousedown yet.
    if (this.initialCanvasCoords === null || this.initialOrigin === null) {
      return;
    }

    const deltaX = coords[0] - this.initialCanvasCoords[0];
    const deltaY = coords[1] - this.initialCanvasCoords[1];
    this.engine.editor.origin = [this.initialOrigin[0] - deltaX, this.initialOrigin[1] - deltaY];
  }

  end(): void {
    super.end();
    this.initialOrigin = null;
  }
}
