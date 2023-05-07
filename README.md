# mazecraft

## Attributions.

TODO.

Textures: https://github.com/ClassicFaithful/64x-Jappa

## Events

- dragging to pan the map
- click a tile to place something
- click and drag to place many things
- click an drag to place a box.

## Command pattern for drawing on the map.

I need to be able to freehand draw, interactively see the progress, and keep an undo history.

- need to track every pixel that got drawn on

- need to draw them in real-time.

- once mouseup, need to keep a history of the entire drawn set of pixels and their previous values.


So once mousedown begins, start checking for pixels. Every time a pixel is being drawn that hasn't already been drawn, add it to the "drawn" array and add "previousValue" to the drawnArray.

previousValue is a number (enum mapping to tile)
drawn is a number (enum mapping to tile)


