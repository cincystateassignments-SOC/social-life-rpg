# Social Life: Queen City — Entity Sprites v5

This build replaces the standing plaza characters with independent sprite entities and fixes the player's clipped head by adding transparent headroom to every animation frame.

## What changed
- Player sprite: 64×88 frames with 8 px transparent headroom; no flat/cropped hairline.
- Professor Burns and four standing plaza residents are independent sprite entities.
- Y-sorting uses each character's foot position: walk above someone and they render in front; walk below them and the player renders in front.
- NPCs dynamically block movement, so the player cannot occupy the same standing space.
- Clicking an NPC routes the player to a valid adjacent position rather than onto the NPC.
- Static scenery still uses the collision mask.
- Shift+D toggles the collision debug overlay.

## Important development note
The seated café patrons and bench reader remain part of the environmental art in this pass; they are treated as static scenery/collision. The mobile/standing cast is now entity-based, which establishes the reusable architecture for schedules, moving NPCs, recurring characters, and later scenarios.

Upload the contents of this folder to the root of the GitHub Pages repository, preserving the `assets/` folder.
