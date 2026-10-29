# Lil8TD

Old school pixel-style top-down tower defense game project.

## Status

**Playable demo vs AI.** A complete mirrored-duel match in the browser: title menu with difficulty
pick, how-to-play, 10 authored waves on a winding map, 5 towers with 3 upgrade levels, 6 raider
types including a boss, pressure sends both ways, a heuristic AI opponent (Easy / Normal / Hard),
result screen, synthesized sound, and Sprite Set V2 art. Online 1v1 is the next milestone.

See `docs/DEMO_SCRIPT.md` for the guided walkthrough.

## Current direction

- Top-down old school pixel style
- Playable against AI bots
- Online 1v1 support
- Reuse the strongest architectural lessons from LW2B and MultiWebCore

## Core premise

Lil8TD is a new game project, not a reskin of LW2B.
It should reuse:
- LW2B as a source of deterministic simulation, AI structure, balance/data architecture, and testing discipline
- MultiWebCore as the multiplayer networking core for room/match lifecycle and canonical online input flow

## Core docs

Start with:

- `docs/VISION.md` — product and experience direction
- `docs/GAMEPLAY_CONCEPT.md` — core game model and PvP shape
- `docs/MVP_SCOPE_DECISIONS.md` — frozen execution scope for the first MVP path
- `docs/DESIGN_FOUNDATION_LOADOUTS.md` — MVP loadout/doctrine package baseline
- `docs/PRESSURE_MECHANIC_V0.md` — first PvP pressure mechanic design anchor
- `docs/ECONOMY_MODEL_V0.md` — first economy model for defense/upgrade/pressure tradeoffs
- `docs/BALANCE_BASELINE_V0.md` — provisional numeric seed baseline for the first playable/simulation pass
- `docs/GAMEPLAY_VARIETY_RANDOMNESS_PASS_V0.md` — gameplay-thinking pass for enemy/wave/tower variety and deterministic-friendly randomness
- `docs/WAVE_TEMPLATE_GRAMMAR_V0.md` — named wave templates, pacing grammar, seeded variants, and PvP pressure-window authoring rules
- `docs/ENEMY_ROLE_LANGUAGE_V0.md` — enemy archetype language, readable traits, counters, and safe roster expansion rules
- `docs/TOWER_ROLE_LANGUAGE_V0.md` — tower archetype language, readable jobs, synergies, upgrade identity, and safe roster expansion rules
- `docs/FIRST_IMPLEMENTATION_MILESTONE.md` — smallest local playable target
- `docs/MVP_ROADMAP.md` — broader milestone sequence
- `docs/ARCHITECTURE.md` — high-level system boundaries
- `docs/TECH_SPEC_V0.md` — initial technical specification
- `docs/SIMULATION_CONTRACT.md` — deterministic sim/tick/order implementation anchor
- `docs/COMMAND_PROTOCOL_DRAFT.md` — game-command payload semantics
- `docs/REUSE_ANALYSIS.md` — LW2B/MWC reuse boundaries

## Visual direction docs

- `docs/LIL8TD_VISUAL_RESEARCH_PACK_V1_DANDADAN.md` — visual research pack, stylistic branches, palette logic, and final direction recommendation
- `docs/LIL8TD_ART_BRIEF_V2.md` — production art brief for Sprite Set V2
- `docs/LIL8TD_SPRITE_SET_V2_TASKLIST.md` — concrete asset tasklist and execution order for Sprite Set V2
- `docs/LIL8TD_VISUAL_DOCTRINE_V1.md` — current live visual doctrine / review language
- `docs/ART_FOUNDATION_MIGRATION_PLAN.md` — asset-migration framing from procedural prototype to authored pixel art
- `docs/PIXEL_STYLE_GUIDE_V0.md` — earlier visual foundation / historical reference

Supporting plans:

- `docs/CONTENT_PLAN_V0.md`
- `docs/BOT_AI_PLAN_V0.md`
- `docs/MWC_INTEGRATION_PLAN.md`
- `docs/TASKLIST_MVP.md`

Machine-readable content:

- `content/ruleset.v0.json` — first provisional data ruleset for local deterministic simulation


## Demo vs AI

What is in the build:

- **Match model**: mirrored dual-board duel (`MVP_SCOPE_DECISIONS.md`). You and the AI defend identical
  boards against the same waves; a keep at 0 lives collapses and loses. If both survive, more lives wins.
- **Map**: *Mossy Switchback*, 12×8 tiles, one winding lane from the rift to your keep.
- **Towers**: Arrow (baseline), Burst (splash), Frost (slow), Piercer (anti-heavy, cracks shields),
  Beacon (non-stacking damage aura); each has 3 levels; sell refunds 65%.
- **Raiders**: Grunt, Runner, Brute, Swarmling, Shield Bearer, Moss Warlord (final-wave boss).
- **Waves**: 10 template-named waves (Baseline Stream → Warlord) with HP scaling and wave-start payouts.
- **Pressure**: Grunt Squad / Runner Rush / Brute Drop packs paid in credits, delivered to the opponent
  after a visible windup, with cooldowns, unlock waves and a queue cap (`PRESSURE_MECHANIC_V0.md`).
- **AI** (`src/ai/bot.js`): value-per-credit build/upgrade choice scaled by upcoming wave roles,
  recovery/fortify postures, timed send plans; reads only visible state and issues normal commands.
- **UI**: HUD, next-wave preview, incoming-pressure warnings, build cards with hotkeys, tower inspector,
  opponent mini-board with live AI intent, wave banners, FX, WebAudio sound, desktop + mobile layouts.
- **Practice** mode: solo board, no opponent, same waves.

Controls: `1`–`5` towers · click/tap grass to build · click a tower to inspect · `U` upgrade · `S` sell ·
`Z` `X` `C` send raiders · `Space` pause · `F` speed 1x/2x/3x · `M` sound · `Esc` cancel / menu.

The current visual workstream is moving from prototype art toward **Sprite Set V2** under the direction:

**Cozy RTS Miniatures + Dandadan Accents**

That means:
- calm handcrafted battlefield base
- stronger hero-tower silhouettes
- more characterful enemies
- selective crimson/teal supernatural accent energy

### Run locally

```bash
npm start
# open http://localhost:4173
```

No install step is required; the game uses browser ES modules and Node built-ins only.
GitHub Pages deploys the same static files (`.github/workflows/deploy-pages.yml`, on `master`).

### Verify

```bash
npm run build   # static/module sanity check
npm test        # deterministic sim, pressure, result-rule and bot tests
npm run smoke   # solo + bot-vs-bot ladder table (expects 0 rejected commands, every match ends)
```

### Content and art pipelines

```bash
node scripts/generate-ruleset.mjs        # rewrite content/ruleset.v0.json from the authoring source
python3 scripts/generate-handdrawn-art.py # rebuild the Sprite Set V2 atlas (needs Pillow)
```

### Code map

- `src/sim/` — deterministic simulation: `sim.js` (match/boards/commands/phases), `map.js` (lane geometry),
  `content.js` (ruleset indexing, wave expansion), `hash.js`, `rng.js` (bot-only PRNG)
- `src/ai/bot.js` — AI opponent profiles
- `src/render/` — `renderer.js` (atlas terrain/entities), `fx.js` (client-side effects), `style.css`
- `src/game/` — `main.js` (screens, input, loop, HUD), `audio.js` (WebAudio synth)

## Trigger phrase

In chat, the project can be resumed with:

**Проект Lil8TD**
