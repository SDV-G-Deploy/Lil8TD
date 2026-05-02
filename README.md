# Lil8TD

Old school pixel-style top-down tower defense game project.

## Status

Playable browser prototype + visual direction pre-production for Sprite Set V2.

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


## Local playable slice

A first local-only vertical slice now exists: one fixed-path map, scripted waves, Arrow/Burst/Frost towers, tower placement, upgrades, selling, leaks/lives, win/loss, HUD, and a conservative scripted bot for smoke validation.

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

No install step is required; the slice uses browser ES modules and Node built-ins only.

### Verify

```bash
npm run build   # static/module sanity check
npm test        # deterministic sim/unit smoke tests
npm run smoke   # scripted bot full-match run
```

Current smoke expectation: bot reaches a terminal win around tick 3450 with deterministic final hash output.

## Trigger phrase

In chat, the project can be resumed with:

**Проект Lil8TD**
