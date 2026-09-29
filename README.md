# Queen City Sprite + Collision Mask v4

This build replaces the procedural block avatar with a real pixel-art sprite sheet and replaces shape-based collision with a raster collision mask aligned to the Queen City world image.

## Test first
1. Walk the student around the fountain. The feet should not cross the fountain/flower/railing footprint.
2. Click inside Riverbend Coffee, the river, fence, planters, café tables, bus, or upper buildings. The pathfinder should stop at/reroute to nearby walkable pavement.
3. Walk toward baked-in NPCs. They are dynamic collision obstacles.
4. Press Shift+D (or Character > Show collision debug overlay) to inspect the hidden navigation mask. Green = walkable; red = blocked.

## Files
- index.html
- style.css
- game.js
- data.js
- assets/queen-city-world.png
- assets/professor-burns.png
- assets/player-sprites.png
- assets/collision-mask.png

Upload the complete contents to the repository root, preserving the assets folder.
