# Lil8TD Visual Doctrine V1 — Handcrafted TD Board

Status: active visual source of truth for the V1 rebuild.

Lil8TD should look like a compact, handmade fantasy tower-defense board: calm moss fields, a built road, squat charming defense pieces, tiny readable invaders, and UI carved from the same wood/bronze/parchment world as the battlefield.

This is not a random polish list. It is the visual contract for future work.

---

## 1. Artistic north star

**Lovable old-school TD diorama.**

The player should feel that they are looking down at a small crafted battlefield, not at a generic HTML canvas demo. The world is warm, earthy, legible, and toy-fortress-like. Every visual element should answer one of four jobs:

1. clarify the lane and buildable spaces;
2. make tower roles recognizable at gameplay size;
3. make enemy roles readable while moving;
4. make UI feel like field-command gear from the same world.

Beauty comes from disciplined shape, material, and hierarchy — not from noise density.

---

## 2. What we take from LW2B as principle, not copy

LW2B is the internal quality benchmark, but Lil8TD must stay its own top-down TD game.

Borrowed principles:

- **Earthy/cozy palette discipline:** restrained moss, umber, stone, brass, parchment; saturated colors reserved for gameplay roles.
- **Chunky sprite grammar:** strong black-shape readability before surface detail.
- **Crafted material language:** wood/stone/brass/parchment motifs should appear in UI, towers, road, and frame.
- **World-owned UI:** HUD and side panel should feel physically related to the board, not pasted-on web controls.
- **Render-only motion feel:** movement can feel smoother and livelier without touching deterministic sim state.

Not borrowed:

- LW2B unit/building proportions literally;
- Warcraft faction/race theming;
- RTS command-panel complexity;
- dense map noise suited to a larger RTS camera.

Lil8TD is flatter, more board-like, and more lane-centric.

---

## 3. Terrain doctrine

Terrain is negative space with craft, not wallpaper.

Rules:

- Grass should be quiet enough that enemies, towers, HP bars, projectiles, range rings, and placement hover win instantly.
- Tile variation should be grouped into large calm value fields, not random speckles.
- Use low-contrast moss pads, short grass strokes, tiny stones, and rare warm flecks.
- Avoid high-frequency flecking across every tile.
- Avoid saturated green. The field is deep moss/olive, not arcade lime.

Good terrain reads as: **soft moss board with handmade tile seams**.

Bad terrain reads as: noisy carpet, debug checkerboard, or procedural trash.

---

## 4. Path doctrine

The path is the compositional spine and must read first.

Rules:

- Path is built/crafted: compacted dirt center, darker rim, occasional side stones, worn highlight bands.
- Path should be continuous across tiles. Individual tile texture must not break lane readability.
- Ornament belongs mostly on path edge or centerline markers, with low count and repeated rhythm.
- Entrance/end markers may add story, but must stay smaller than active enemies/towers.

Good path reads as: **a hand-laid old road through the moss**.

Bad path reads as: a brown stripe, random gravel noise, or a second terrain texture fighting the lane.

---

## 5. Tower silhouette doctrine

Towers are the stars of the player side. They should feel stronger, chunkier, and more lovable than temporary projectiles.

Shared grammar:

- squat stone/wood plinth;
- dark aperture/shadow slot;
- brass/cream trim;
- role-specific top silhouette;
- level badge integrated into the body, not floating generic UI.

Role shape ideas:

- **Arrow:** vertical mast + crossbar + bolt tip. Precise and reliable.
- **Burst:** broad cannon/mortar + hot diamond core. Heavy and explosive.
- **Frost:** tall crystal/spire + pale cyan diamond. Control/magic.

Invariant: if the sprite is reduced to a black silhouette, the role should still be guessable.

---

## 6. Enemy silhouette doctrine

Enemies are tiny units, not flat icons.

Rules:

- One role, one body idea.
- Keep the HP bar from swallowing the body; do not overdetail under it.
- Motion direction should be readable: forward lean, feet/arms, or facing accent.
- Colors identify role, but silhouette must carry the first read.

Role shape ideas:

- **Grunt:** balanced small infantry; helmet/cap; centered mass.
- **Runner:** low forward lean; longer body; tiny trailing step mark.
- **Brute:** wide block; horns/shoulders; heavy slower mass.

---

## 7. UI doctrine

UI belongs to the board world.

Rules:

- Use carved wood, bronze trim, parchment text, inset shadows, corner jewels.
- Primary HUD facts should sit in a single top command plaque.
- Side panel is an anchored command slab, not a generic web card.
- Buttons are command plaques with stable spacing and role accents.
- Avoid debug-first labels in the primary visual hierarchy.

The player should feel the canvas frame, HUD, and panel were built by the same craftsperson.

---

## 8. Motion-feel doctrine

Sim remains deterministic. Feel lives in render.

Allowed:

- render-only sub-tick enemy position smoothing/extrapolation from current sim progress;
- tiny bob based on visual progress/time;
- facing/readability accents for right-moving lane units;
- small local attack/impact shapes tied to existing events.

Forbidden:

- changing enemy progress, tower cooldown, command order, hit logic, or spawn timing for visual reasons;
- adding particle systems that outshine role silhouettes;
- motion that makes hit/placement perception misleading.

Motion target: **less jumpy, more alive, still board-game readable**.

---

## 9. TD readability invariants

These rules beat beauty:

1. Lane vs build terrain readable in peripheral vision.
2. Towers visible above terrain and UI hover.
3. Enemy HP state readable without zooming.
4. Projectile/attack effects brief and directional.
5. Placement hitboxes unchanged and visually honest.
6. Role colors have stable meaning.
7. No ornament has equal priority to enemies/towers.
8. The board should still be understandable in one glance on GitHub Pages/mobile-width screenshots.

---

## 10. Anti-patterns

Avoid:

- infinite random polish passes without a doctrine target;
- high-frequency procedural speckles;
- neon glow as a replacement for shape design;
- tiny unrelated decorative motifs everywhere;
- copying LW2B assets/proportions literally;
- UI chrome that looks like a separate website theme;
- render changes that leak into deterministic sim state;
- overlarge FX that obscure enemies under fire.

---

## 11. Phased extension plan

### Phase 1 — V1 foundation

- Calm terrain and crafted path.
- Stronger tower/enemy silhouettes.
- Board/UI material unification.
- Render-only enemy movement smoothing and subtle bob.

### Phase 2 — Role polish

- Per-role attack read improvements.
- Better selected-tower command card.
- Tower upgrade visual stages if still readable.

### Phase 3 — Content-scale resilience

- Additional tower/enemy roles must pass silhouette-first review.
- More lane shapes require path material continuity rules.
- More UI surfaces must reuse the same wood/bronze/parchment system.

### Phase 4 — Optional art pipeline

- If the static atlas remains useful, expand it carefully.
- If atlas cost outweighs value, keep procedural pixel primitives but retain this doctrine.

---

## 12. Relationship to older docs

`docs/PIXEL_STYLE_GUIDE_V0.md` remains useful historical foundation, but this V1 doctrine is now the source of truth for visual direction and review language.

---

## 13. Corrective hand-drawn pass — May 2026

Why it was necessary:

- The first live visual demo still read as a clean prototype board with better colors, not as charming game art.
- Prior changes were too subtle at mobile screenshot size: tile tuning and procedural polish improved neatness but did not create a strong handmade identity.
- The next useful step was therefore not more cleanup; it was a visible hand-drawn asset pass with bigger shapes and personality.

What changed in this pass:

- Added `assets/art-handdrawn/lil8td-handdrawn-v1.png`, a new static pixel atlas that preserves the lightweight Pages-friendly pipeline.
- Replaced the renderer atlas source with the hand-drawn atlas.
- Grass/buildable tiles now use larger painted moss fields, irregular outlines, weed/stone landmarks, and broader brush strokes instead of tiny procedural-feeling texture.
- Path tiles now have a meandering compacted-road center, darker shoulders, chunky stones, and stronger warm dirt material so the lane reads first.
- Towers received stronger role silhouettes: arrow has an oversized bow/bolt and flag, burst has a squat cannon/ember core, frost has a tall crystal obelisk.
- Enemies received more character-forward silhouettes: grunt as small shield soldier, runner as low red forward-leaning unit, brute as wide purple horned mass.
- Board seams were reduced so the atlas material carries the art read instead of a sterile grid.
- UI frame ornament pieces were redrawn to match the carved/handmade direction.

Still remaining for future art passes:

- Add per-upgrade tower stages so level changes are visible beyond the badge.
- Add attack-impact micro-sprites and muzzle/ice/arrow read improvements without changing sim timing.
- Expand UI atlas usage into buttons/cards instead of relying mostly on CSS chrome.
- Create more terrain transition logic if the map grows beyond the current single-lane board.
- Do a second review from live mobile screenshots; the success criterion is obvious charm at a glance, not subtle asset-diff correctness.

---

## 14. Charming stylization pass — May 2026

Why slight cartoon stylization is useful:

- Lil8TD units are very small on phone-width screenshots; a controlled cartoon push makes role shapes read faster than surface detail.
- Toy-soldier exaggeration gives towers/enemies personality while preserving the old-school RTS board feeling.
- Warm, handmade asymmetry helps the game feel authored rather than procedurally decorated.

Guardrails for this direction:

- Keep colors earthy and warm; role colors may pop, but never become neon or candy-saturated.
- Prefer silhouette exaggeration over glossy gradients, plastic highlights, or generic mobile-game bounce.
- Add only chunky, low-count decorative accents; no confetti noise across terrain or path.
- FX should be brief, local, and directional. They may improve impact readability but must not obscure enemies, HP bars, or placement reads.
- UI ornaments should feel carved/field-command-like, not heavy chrome competing with the board.

What changed in this pass:

- Towers were pushed toward more lovable toy-fort silhouettes: arrow got a jauntier oversized bow/pennant, burst a friendlier kettle-cannon/ember read, frost a taller playful crystal crown.
- Enemies gained stronger tiny-unit character: grunt has bigger horn/cap/shield personality, runner has clearer fox-like ears and speed streaks, brute is wider with larger horns/arms.
- Attack effects gained restrained shadow/highlight layering and smaller impact accents for juicier feedback without particle noise.
- Slow feedback became a lighter dashed icy box with a small ground glint, keeping it readable but less blocky.
- Terrain/path received only rare storybook accents and roadside flags, preserving the path/build-tile hierarchy.
- UI chrome received tiny ornamental glyphs on the command plaque/buttons to add charm without increasing layout weight.
