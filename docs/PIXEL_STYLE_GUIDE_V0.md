# Lil8TD Pixel Style Guide V0

Status: evolved practical visual pass for the public browser demo. This is still a lightweight canvas-first direction, but the target has moved from “readable prototype pixels” toward a small nostalgic RTS/fantasy board with warmth, craft, and charm.

## Visual direction

Lil8TD should feel like a compact old-strategy battlefield: a cozy, readable fantasy diorama, with chunky silhouettes and hand-built-looking materials. The reference mood is classic RTS nostalgia — warm earth, carved UI panels, fortified little buildings, tiny characterful units — without copying any specific game interface or asset.

Target feeling: a small noble battlefield carved out of parchment, earth, stone, moss, and bronze. Gameplay readability stays first, but the board should no longer look like raw debug geometry.

## Palette families

Use a restrained warm/cool palette with stable gameplay accents.

- **Board base:** deep forest greens, moss, warm olive highlights, muted tan flowers/rocks.
- **Road/path:** umber rims, packed ochre dirt, dusty gold highlights, small worn stones.
- **Frame/UI:** dark carved wood, bronze trim, parchment/gold text accents.
- **Towers:** shared stone/wood base plus role accent:
  - Arrow: muted yellow/cream = reliable marksman/bolt identity.
  - Burst: orange/bronze = explosive cannon identity.
  - Frost: cyan/icy white = control/crystal identity.
- **Enemies:** readable fantasy unit accents:
  - Grunt: tan/ochre body, small infantry anchor.
  - Runner: red/coral forward-leaning scout threat.
  - Brute: purple heavy horned pressure unit.
- Add value contrast and silhouette first; add new hues only when a role cannot be read otherwise.

## Terrain material rules

- Grass/build tiles should be alive but not noisy: alternating deep greens, a few deterministic flecks, small moss/flower/stone marks, and subtle top/bottom lighting.
- Every tile may have texture, but no tile should visually fight tower/enemy silhouettes.
- Grid lines are diegetic board seams: visible and warm, not neon debug lines.
- Buildable spots can have faint cross-pins so placement reads without turning into a checkerboard.

## Path/readability rules

- The route must be readable at a glance as the main horizontal lane.
- Path tiles are “crafted/worn”: dark earthen rim, packed center, dust strokes, small border stones, and tiny center markers.
- Start/end markers are small banners/gate posts: decorative, symbolic, and lower priority than enemy bodies.
- Path decoration must not obscure HP bars, enemy bodies, or firing feedback.

## Silhouette language

### Towers

All towers share a squat fortified base: shadow, stone body, dark aperture, roof/trim, and a small level badge. The base makes them feel like tiny keep pieces rather than colored markers.

Role tops create instant identity:

- **Arrow:** vertical mast and crossbow/bolt profile; narrow, precise silhouette.
- **Burst:** horizontal cannon barrel plus glowing diamond core; wide, heavy silhouette.
- **Frost:** vertical crystal antenna and icy diamond; tall, magical/control silhouette.

### Enemies

Enemies stay tiny but characterful:

- **Grunt:** centered infantry with cap/helmet, two eyes, balanced stance.
- **Runner:** low forward body, single forward eye, leg streaks/bob for speed.
- **Brute:** wide tall body, horns, heavy arms, broad mass.

Health bars remain above silhouettes and should never hide the identifying body shape.

## Ornament and decoration rules

- Ornament should support the board fantasy: stones, banners, bronze corners, carved panel edges, dust marks.
- Prefer a few deterministic, repeated motifs over random visual noise.
- Avoid high-frequency speckles everywhere; leave calm patches so moving enemies and projectiles pop.
- Keep all art primitive/canvas-friendly: rects, chunky diamonds, simple strokes, no heavy sprite pipeline required yet.

## UI frame styling principles

- HUD and side panel should feel like old strategy parchment/wood/bronze chrome.
- Buttons may look like carved plaques; active state should be warm gold/brown, not modern blue.
- Typography remains monospace for implementation simplicity, but color, borders, shadows, and hierarchy should carry the fantasy mood.
- UI must stay lightweight and responsive for GitHub Pages.

## Effect language

- Effects are short, high-contrast combat confirmations:
  - Arrow: thin bright bolt plus small impact diamond.
  - Burst: thicker orange shot, circular blast ring, gold impact core.
  - Frost: pale beam, secondary cold line, icy diamond impact.
- Selected range uses restrained dashed/inner rings so it reads as tactical overlay rather than a modern neon debug circle.
- Slow overlay uses cyan frame and small ice diamond; keep it legible but not opaque.

## Gameplay readability constraints

1. Path/build separation must remain stronger than terrain texture.
2. Tower type must be recognizable by silhouette even without UI text.
3. Enemy type must be recognizable by silhouette, mass, and accent color.
4. HP bars and combat events draw over terrain details.
5. Hover/build feedback remains explicit and higher priority than decoration.
6. Deterministic/core gameplay code should not depend on rendering flourishes.

## Implemented in the current nostalgic RTS visual pass

- Rebuilt the canvas palette around warm earth, moss, bronze, parchment, and restrained role accents.
- Upgraded grass/build terrain with deterministic material flecks, moss/flower/stone marks, subtle tile lighting, and faint build pins.
- Reworked the path into a worn crafted road with earthen rims, packed center, dusty highlights, border stones, route ornaments, and small start/end banners.
- Replaced simple tower markers with fortified miniature structures: shared stone bases, roofs, apertures, role-specific tops, shadows, and framed level badges.
- Added more character to enemies: helmeted grunts, forward-leaning runners with motion bob/streak, horned broad brutes with heavy arms.
- Improved combat feedback with distinct arrow/burst/frost effect language and stronger kill/impact sparkle.
- Replaced the blue prototype canvas/HUD styling with wood/bronze/parchment UI framing and carved plaque buttons.
- Improved selection range styling from plain circle to a restrained tactical dashed ring.

## How to extend without degrading into noise

1. Add new material motifs one family at a time; do not sprinkle every tile with every motif.
2. When adding a new tower/enemy, design the silhouette in one dark color first, then add role color.
3. Keep board decoration low contrast except at strategic markers, impacts, and interactable states.
4. New UI chrome should reuse wood/bronze/parchment tokens before introducing another theme.
5. If sprites are introduced later, match the current chunky proportions and palette, then replace procedural primitives gradually.
6. Static GitHub Pages remains a hard constraint: no heavy asset build pipeline unless it clearly improves the shipped demo.
