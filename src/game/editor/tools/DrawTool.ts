import { EditorTool } from ".";
import { MAX_TILE_DIMENSIONS } from "../../../config";
import { Grid } from "../../../lib/Grid";

export class DrawTool extends EditorTool {
  static readonly toolname = "Draw";
  private grid = new Grid(MAX_TILE_DIMENSIONS);
  private isDrawing = false;

  begin(canvasCoords: Vec2, gridCoords: Vec2): void {
    this.isDrawing = true;
    this.grid.set(gridCoords, this.engine.editor.selectedTile);
  }

  update(canvasCoords: Vec2, gridCoords: Vec2) {
    if (this.isDrawing) {
      this.grid.set(gridCoords, this.engine.editor.selectedTile);
    }
  }

  getRenderCell(coords: Vec2) {
    return this.grid.get(coords);
  }

  end(): void {
    // TODO: returns an EditorCommand instance to put on the command stack.
    this.grid.forEach((v, coords) => {
      this.engine.world.set(coords, v);
    });
    this.isDrawing = false;
    this.grid.clear();
  }
}
