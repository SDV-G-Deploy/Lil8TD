# Lil8TD Pixel Style Guide V0 — Visual Foundation

Status: historical V0 foundation. The active visual source of truth is now `docs/LIL8TD_VISUAL_DOCTRINE_V1.md`.

This document remains useful background for the public canvas demo. The V1 doctrine supersedes it where the two differ.

Update: the project has started its first real asset migration. See `docs/ART_FOUNDATION_MIGRATION_PLAN.md` for the phased plan and `assets/art-v1/lil8td-art-v1.png` for the first static pixel atlas.

## Artistic north star

Lil8TD should feel like a tiny old-fantasy strategy board: mossy build fields, a hand-worn road, squat fortified toy towers, small readable monsters, and carved wood/bronze UI chrome. The beauty target is **lovable miniature battlefield**, not realistic terrain and not noisy pixel wallpaper.

The right feeling:

- warm, crafted, and slightly storybook;
- nostalgic RTS/board-game energy;
- chunky primitive pixel shapes that look intentional;
- readable gameplay first, decorative charm second;
- one cohesive material world: moss, earth, stone, wood, bronze, parchment, role-color magic.

## Beauty principles

1. **Foundation before embellishment.** Every detail must reinforce palette, material, silhouette, or hierarchy. Avoid “more pixels” as a substitute for taste.
2. **Calm fields, lively focal points.** Terrain may have texture, but moving enemies, towers, HP bars, hover, and attacks must remain the sharpest reads.
3. **Chunky shape language.** Rectangles, diamonds, plaques, squat bases, crenellated/fortified proportions, and simple banners are the project’s native forms.
4. **Warm/cool discipline.** Most of the world is warm earth/wood/bronze and deep moss. Cool cyan is reserved for frost/control and should feel special.
5. **Handmade rhythm, not randomness.** Decoration should be deterministic, repeated, and grouped into motifs: road stones, dust strokes, moss pads, build pins, panel corner jewels.
6. **Toy-fortress proportions.** Towers should feel like tiny keep pieces placed on a board, with shared bases and distinct role tops.

## Palette families

### Board / grass family

- Deep greens: forest base, calm negative space.
- Moss/olive: restrained tile variation and soft pads.
- Muted flower/gold: tiny warmth accents only.
- Slate/stone: small grounded terrain marks.

Rule: grass supports gameplay. It should look alive but never compete with towers or enemies.

### Path / road family

- Dark umber rim.
- Packed ochre dirt center.
- Dusty gold highlights.
- Muted border stones.

Rule: the path is the main compositional spine. It must read instantly as a crafted lane, not a debug stripe.

### UI / frame family

- Dark carved wood.
- Bronze/gold trim.
- Parchment text accents.
- Small diamond corner ornaments.

Rule: UI chrome should share the same “crafted board” language as the canvas frame, not feel like a separate modern web panel.

### Role accent family

- Arrow: gold/cream, precise and reliable.
- Burst: orange/bronze, heavy and explosive.
- Frost: cyan/white, magical and controlling.
- Enemies: tan grunt, coral runner, purple brute.

Rule: role colors are gameplay signals. Do not introduce new saturated colors unless they carry new gameplay meaning.

## Material families

- **Moss field:** deep green fill, subtle top light, warm lower shadow, sparse blades/pads/flowers/stones.
- **Built road:** rim, compacted center, center dust streak, side stones, small route diamonds.
- **Fortified tower:** shadow plinth, stone body, dark aperture, roof band, trim strip, role-specific top.
- **Carved UI:** wood slab, bronze frame, parchment/gold type, corner diamonds, inset lines.
- **Combat magic:** short-lived high-value strokes and diamonds; never large persistent glow.

## Shape language / silhouette doctrine

### Global motifs

- Rectangular slabs = structure/material.
- Diamonds = ornament/magic/focal markers.
- Horizontal bands = crafted construction and UI plaques.
- Squat bases = defensive board-piece identity.
- Small banners = start/end narrative markers.

### Towers

All towers share the same base so they belong to one material family. Identity comes from the top silhouette:

- **Arrow:** narrow mast + crossbar + bolt tip. Reads vertical/precise.
- **Burst:** wide cannon + glowing diamond core. Reads heavy/volatile.
- **Frost:** slim antenna + crystal diamond. Reads tall/magical/control.

If a new tower is added, design it first as a black silhouette at gameplay size. If it cannot be recognized by mass/proportion, palette will not save it.

### Enemies

- **Grunt:** centered infantry, helmet/cap, balanced stance.
- **Runner:** low forward lean, motion streaks, single forward eye.
- **Brute:** wide mass, horns, heavy arms.

Enemy bodies should remain simple enough to read under HP bars and attack effects.

## Ornament discipline

Good ornament:

- repeats established motifs;
- is low contrast on terrain;
- appears in purposeful zones: road edge, UI corners, tower badges, start/end markers;
- helps materials feel handcrafted.

Bad ornament:

- random speckles everywhere;
- many unrelated shapes or colors;
- decoration with equal contrast to enemies/projectiles;
- modern neon overlays that break the old-board fantasy.

## Readability guardrails

1. Path vs build terrain must be readable in peripheral vision.
2. Towers must be recognizable without reading button labels.
3. Enemies must be recognizable by mass and posture, not just color.
4. HP bars, hover feedback, and combat events always sit above terrain detail in priority.
5. Selection/range visuals should feel tactical and restrained, not like debug neon.
6. Rendering flourishes must not affect deterministic sim logic or tests.
7. The project remains lightweight static browser deploy; no heavy asset/build pipeline by default.

## What makes Lil8TD charming specifically

Lil8TD’s charm is the contrast between tiny deterministic systems and a warm toy battlefield presentation. It should feel like placing little fort pieces on moss around an old road while miniature goblin-like threats march through. The charm comes from:

- tiny fortified structures with shared craft language;
- enemies that have posture/personality at very small size;
- road markers and banners that imply a world without needing lore text;
- cozy board materials instead of abstract rectangles;
- restrained, confident use of pixels.

## Anti-patterns / what not to do

- Do not turn every tile into a unique noisy texture.
- Do not add new accent colors for decoration-only reasons.
- Do not make the UI look like generic sci-fi/web dashboard chrome.
- Do not rely on text labels to distinguish tower/enemy roles.
- Do not let effects become large opaque glows that hide units.
- Do not add decorative systems that require a heavy pipeline unless the visual payoff is clearly worth it.
- Do not chase “asset richness” before the composition, palette, and silhouettes are stable.

## What this taste-polish pass implemented

- Re-centered the palette around deeper moss, warmer path earth, more restrained seams, and clearer role accents.
- Added a quiet board underlay so the map feels composed before tile detail appears.
- Reworked grass tiles into calmer material fields: fewer high-frequency marks, deterministic moss/flower/stone accents, stronger top-light/bottom-shadow rhythm.
- Refined the path into a more crafted road: darker edge bands, compacted center variation, dust rhythm, highlighted side stones, and route diamonds.
- Made build pins more diegetic and less debug-like, with tiny grounded shadows and occasional low-contrast tokens.
- Strengthened tower material grammar: shared plinth/body/roof/aperture language, clearer roof trim, stronger shadows, and more role-specific top silhouettes.
- Added small enemy silhouette highlights/details while preserving simple readable masses.
- Tightened web UI chrome toward carved wood/bronze/parchment and aligned it with the canvas frame language.

## How to extend without losing taste

1. Start with a one-sentence role fantasy, then a black silhouette, then material, then accent color.
2. Reuse existing forms first: slab, diamond, banner, plinth, trim band, aperture.
3. Add only one new motif per pass and decide where it is allowed to appear.
4. Keep terrain lower contrast than towers/enemies/effects.
5. If the screen feels busy, remove or lower terrain detail before simplifying gameplay signals.
6. Before adding assets, ask whether procedural rectangles/diamonds can express the idea cleanly.
7. Test at actual browser size; taste is judged at play scale, not zoomed-in code scale.

## Asset migration addendum

Procedural canvas drawing remains useful for overlays, effects, and fallback rendering, but core charm should increasingly live in authored sprites. The first atlas pass establishes this rule:

- terrain, path, towers, enemies, and UI ornaments should become reusable pixel assets;
- procedural drawing may support them but should not be the primary source of identity;
- each new asset must preserve the same palette, silhouette, and readability doctrine above;
- GitHub Pages stays lightweight: committed static images, no mandatory heavy art build step.
