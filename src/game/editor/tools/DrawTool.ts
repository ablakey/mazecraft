import { EditorTool } from ".";
import { MAX_TILE_DIMENSIONS } from "../../../config";
import { Grid } from "../../../lib/Grid";

export class DrawTool extends EditorTool {
  static readonly toolname = "Draw";
  private grid: Grid<number> = new Grid(MAX_TILE_DIMENSIONS);

  begin(initialCanvasCoords: Vec2, initialGridCoords: Vec2): void {
    super.begin(initialCanvasCoords, initialGridCoords);
    this.grid.set(initialGridCoords, this.engine.editor.selectedTile);
  }

  update(canvasCoords: Vec2, gridCoords: Vec2) {
    // Only be drawing if we have started.
    if (this.initialCanvasCoords) {
      this.grid.set(gridCoords, this.engine.editor.selectedTile);
    }
  }

  getRenderCell(coords: Vec2) {
    return this.grid.get(coords);
  }

  end(): void {
    this.grid = new Grid(MAX_TILE_DIMENSIONS);
    this.initialCanvasCoords = null;
    // TODO: returns an EditorCommand instance to put on the command stack.
  }
}
