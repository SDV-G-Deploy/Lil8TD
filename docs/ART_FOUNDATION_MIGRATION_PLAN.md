# Art Foundation Migration Plan — From Procedural Demo to Handcrafted Pixel Board

Status: first asset-migration foundation.  
Target: keep the static browser demo light, but start replacing procedural charm ceilings with real authored pixel assets.

## Why the procedural canvas pass has reached its ceiling

The current canvas renderer proved the composition, palette, role colors, and readable board language. It also exposed the limit: procedural rectangles can polish a demo, but they struggle to create **memory, touch, and authorship**. The result can become tasteful, yet it still feels generated because:

- tile texture is decorative variation, not a deliberately painted material;
- tower/enemy identity depends too much on drawing instructions instead of recognizable sprite silhouettes;
- details are hard to revise as art because they are embedded in renderer code;
- more procedural noise risks reducing readability instead of adding charm;
- UI ornaments and board details cannot share a reusable asset language yet.

The next quality jump therefore needs real pixel assets, even if the first set is tiny.

## Visual target

Lil8TD should move toward **nostalgic fantasy RTS warmth**: AoE2-adjacent in coziness and material clarity, but original, smaller, chunkier, and more toy-board-like.

The target is not realism. It is a handcrafted miniature battlefield:

- mossy build fields with calm texture;
- a packed, built road with side stones and dust;
- squat defensive tower pieces with shared construction language;
- enemies readable by posture and mass at gameplay size;
- carved wood / bronze / parchment UI pieces that feel from the same world.

Keywords: cozy, readable, warm, old-board, fortified toy pieces, compact fantasy tactics.

## Asset families

### 1. Terrain / tileset

Purpose: make the board feel painted rather than filled.  
Needs:

- grass/moss variants with restrained frequency;
- darker field edge/shadow rhythm;
- occasional stone/flower/moss accents;
- enough variation to avoid checkerboard repetition without visual noise.

### 2. Path pieces

Purpose: turn the lane into the compositional spine.  
Needs:

- packed dirt center;
- darker rim/edge bands;
- dust strokes;
- side stones and worn highlights;
- later: turns, transitions, entrance/exit caps, intersections if map topology expands.

### 3. Tower sprites

Purpose: role identity at a glance.  
Needs:

- shared base/plinth/body material;
- distinct top silhouettes:
  - Arrow: narrow mast/crossbar/bolt profile;
  - Burst: wide cannon/core/heavy mass;
  - Frost: slim antenna/crystal/cool verticality;
- level badge or upgraded sprite overlays.

### 4. Enemy sprites

Purpose: moving personality without hurting HP/effect readability.  
Needs:

- Grunt: centered infantry mass;
- Runner: low lean and forward motion;
- Brute: wide heavy body/horns/arms;
- later: two-frame walk cycles, damage flash overlays, death puffs.

### 5. Projectile / effect sprites

Purpose: effects feel magical and authored while staying transient.  
Needs:

- arrow bolt impact pixel;
- burst ring/core;
- frost shard/beam caps;
- kill sparkle and slow icon overlays.

Procedural line drawing can remain for beams until sprite caps/particles exist.

### 6. UI frame pieces

Purpose: make the web UI and canvas frame share a handcrafted board identity.  
Needs:

- corner jewels;
- horizontal trim strips;
- small tower role icons;
- button plaque backgrounds;
- panel separators.

## Minimal first art pack for playable beauty

The first usable pack should contain:

- 4 grass tiles;
- 4 path tiles;
- 3 tower sprites;
- 3 enemy sprites;
- 1-3 UI ornament pieces;
- optional tiny role icons.

This is enough to make the live demo visibly asset-based while leaving procedural support for:

- hover/range overlays;
- health bars;
- projectiles/beams;
- deterministic route ornaments;
- fallback rendering if assets fail to load.

## Current first-pass pack

Implemented in `assets/art-v1/lil8td-art-v1.png`:

- grass0-3, path0-3;
- towerArrow, towerBurst, towerFrost;
- enemyGrunt, enemyRunner, enemyBrute;
- uiCorner plus tiny role icon source pixels.

The renderer uses the atlas directly with `image-rendering: pixelated` and falls back to procedural drawing if the image is not loaded yet.

## Size and palette constraints

- Keep source sprites small: 16/32/48px source logic, scaled by browser canvas.
- Prefer one small atlas per pack over many large loose files.
- Maintain pixelated nearest-neighbor rendering.
- No heavy build pipeline for the public static demo.
- Palette stays inside the existing families:
  - deep moss and olive for board;
  - umber/ochre/dust for road;
  - stone/wood/bronze for towers/UI;
  - role accents only for gameplay identity.

Saturation belongs to gameplay signals, not background decoration.

## Silhouette rules

- Judge every tower/enemy as a black shape at gameplay size before coloring it.
- Towers share a base; identity comes from top mass.
- Enemies differ by posture:
  - centered, forward-leaning, wide-heavy.
- Avoid single-pixel facial detail as the primary read.
- HP bars and effects must remain legible over all enemy sprites.

## Integration strategy

1. Add a tiny static atlas under `assets/art-v1/`.
2. Hardcode atlas coordinates in renderer for now; avoid manifest fetch or build complexity until asset count justifies it.
3. Keep procedural renderer functions as fallbacks and support layers.
4. Replace only visual drawing calls; do not touch sim, hit testing, map rules, or command logic.
5. Use deterministic tile variant selection via existing `hash(x, y)` so gameplay and visuals remain stable.
6. Add docs/provenance so future art passes can improve the atlas intentionally.

This keeps GitHub Pages deploy simple: HTML + JS + CSS + PNG.

## What remains procedural for now

Good to keep procedural:

- range rings;
- hover valid/invalid overlays;
- HP bars;
- projectiles/beams until sprite caps exist;
- map frame strokes around the asset corners;
- deterministic road markers/build pins as low-cost world dressing.

Should migrate to assets soon:

- path turns/caps/transitions;
- upgraded tower variants;
- enemy walk frames;
- projectile impact puffs;
- UI buttons/panel strips and icons.

## Phased roadmap

### Phase 1 — Foundation atlas (now)

- One static atlas.
- Terrain/path/tower/enemy/UI corner sprites.
- Renderer draws sprites with procedural fallbacks.
- No gameplay or input changes.

### Phase 2 — Tile grammar

- Add edge/corner/transition path pieces.
- Add grass-to-road edging and small terrain clusters.
- Reduce procedural path ornament dependence.

### Phase 3 — Character charm

- Add two-frame enemy animation.
- Add upgraded tower sprite overlays.
- Add projectile/impact sprite caps.

### Phase 4 — UI asset skin

- Replace CSS-only chrome with reusable pixel frame strips/corners/buttons/icons.
- Add tower role icons to buttons and selected panel.

### Phase 5 — Pipeline only if needed

- Introduce a manifest and optional atlas packer only when manual coordinates become costly.
- Keep generated output committed for GitHub Pages.
- Avoid turning art iteration into a build dependency unless the asset count demands it.

## Quality bar for the next art pass

The next pass is successful if a player can identify the three towers and three enemies from silhouette/posture alone, and if the board feels like a small crafted object rather than a styled canvas demo.
