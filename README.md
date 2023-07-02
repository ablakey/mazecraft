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


## Ideas

- Show the missing upgrades greyed out. I'm thinking like analog indicator lights. 8 total. 2 columns.
- Show empty minimap, top-right. It should be especially large.
- 1:1 ratio viewport.
- Editor becomes a separate thing you can tab into.  (Is it a separate browser tab?)

## 8 Upgrades (ideas)

- Higher resolution viewport
- Sounds
- The Minimap  (an upgrade that you can get multiple times?)
  - Lidar only
  - With history (ie. what blocks you've seen)
  - with texture? (ie. before it's just filled or not... then there's textures)
-
