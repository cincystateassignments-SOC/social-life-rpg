# Social Life — Queen City Fresh Build v1

This is a clean restart, not a continuation of the earlier prototype code.

## Design rules
- Characters are native transparent sprite sheets (48x64 frames), not cropped from composite images.
- Full headroom is built into every frame; no flat/clipped heads.
- Collision is map/object data from the beginning.
- Collision is based on feet footprints.
- Professor Burns is a separate sprite/entity and blocks the player.
- Click/tap uses A* pathfinding to reachable foot positions.
- Press D for collision debug.
- Static world art contains no interactive characters.

## Test first
1. Click around Riverbend.
2. Try to click inside the building, fountain, trees, benches, fence/river.
3. Try to walk through Professor Burns.
4. Click Professor Burns; the player should route adjacent and open dialogue.
5. Press D to inspect collision zones.

The environment art is intentionally simple in this engineering build. The goal is to validate movement, sprites, collision, depth/entity architecture before investing in final tile art.
