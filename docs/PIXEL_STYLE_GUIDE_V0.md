# Lil8TD Pixel Style Guide V0

Status: first practical visual pass for the public demo. This is a lightweight canvas-render direction, not a production art pipeline.

## Visual direction

Lil8TD should read as a compact, tactical pixel-board: chunky silhouettes, high-contrast role colors, visible grid decisions, and quick combat feedback. The game can stay procedural/canvas-first as long as it looks intentional rather than like raw rectangles.

Target feeling: small fantasy-tech battlefield, clean enough for fast tower-defense decisions.

## Palette approach

- Use a limited dark-board palette with bright role accents.
- Grass/build tiles stay in deep greens with small lighter pixel flecks.
- Path tiles stay warm brown/gold so the route is instantly separated from build space.
- Towers and enemies use stable identity colors:
  - Arrow: yellow/cream = reliable baseline damage.
  - Burst: orange/gold = splash/explosive role.
  - Frost: cyan/ice = slow/control role.
  - Grunt: muted tan = baseline readability anchor.
  - Runner: red/pink = speed/leak threat.
  - Brute: purple = heavy pressure.
- Avoid too many new hues at once; add value contrast before adding colors.

## Readable silhouettes

- Every unit must be identifiable without reading text.
- Towers should have a shared base plus distinct top shapes:
  - Arrow: small launcher/bolt profile.
  - Burst: horizontal cannon/core.
  - Frost: vertical crystal antenna.
- Enemies should differ by body mass and stance:
  - Grunt: square, centered, average size.
  - Runner: low, forward-leaning, small and fast-looking.
  - Brute: wide, tall, horned/heavy.
- Health bars stay small but high-contrast; they should not hide the body silhouette.

## Tiles and grid rules

- The grid is part of the game language, not decoration: keep cell borders visible.
- Build tiles use subtle pixel noise/flecks, never busy texture.
- Path tiles get lane markings and edge shading so movement direction is obvious.
- Start/end markers can be symbolic and tiny; do not let them compete with enemies.
- Renderer hit testing must use the same board metrics as drawing. If canvas aspect changes, coordinate mapping must still match visual tiles.

## Towers, enemies, effects, UI

- Towers: use chunky rect-based construction; keep upgrade level readable on the tower until a better icon language exists.
- Enemies: render on top of path details; keep body colors stronger than path colors.
- Effects: short-lived, simple line/arc feedback is enough for V0. Favor readable target confirmation over particle volume.
- UI/HUD: keep monospace tactical feel. Improve hierarchy with borders, active states, and short labels before adding ornate chrome.

## Implemented in first demo pass

- Canvas now fills the full 8x6 board with consistent rectangular cells instead of drawing a square-tile board into only part of the canvas.
- Added procedural pixel-style grass tiles, path tiles, grid lines, lane markers, and start/end route markers.
- Added distinct pixel silhouettes for Arrow, Burst, and Frost towers.
- Added distinct pixel silhouettes for Grunt, Runner, and Brute enemies.
- Added tower range ring on selection, hover placement overlay, HP bars, slow overlay, and simple firing/splash feedback.
- Fixed mouse tile mapping to use canvas content-box coordinates and the same cell metrics as rendering.

## How to extend without breaking style

1. Add new role colors only when silhouette and value are not enough.
2. Keep all primitives snapped to chunky pixel-like rectangles/diamonds; no antialiased detailed art dependency yet.
3. Add one visual identifier per gameplay role first, polish second.
4. Preserve the readable grid/path separation before adding background detail.
5. If sprites are introduced later, match these proportions and palette first, then replace canvas primitives gradually.
6. Keep GitHub Pages deployment static: no heavy asset pipeline unless it clearly pays for itself.
