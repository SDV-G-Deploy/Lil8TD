# Lil8TD Gameplay Concept

## Core concept

Lil8TD is a top-down pixel-style tower defense game designed for:
- solo play against bots
- online 1v1 competitive play

## Recommended competitive format

Primary format recommendation:
- each player has their own defensive field
- each player builds towers and manages economy/timing
- each player can apply indirect pressure to the opponent through game systems rather than direct RTS army control

This keeps the game aligned with tower defense while still supporting meaningful PvP interaction.

## Candidate PvP pressure models

### Model A, mirrored dual-board competitive TD
Each player:
- defends their own lanes
- builds and upgrades towers
- survives escalating waves
- can trigger pressure actions that affect the opponent

Examples of pressure actions:
- send extra enemy packs
- force shielded wave variants
- apply temporary economy stress
- unlock lane-specific pressure events

### Model B, shared-map split-field TD
- both players exist on one map with separate build zones
- some contested objectives sit between them
- pressure can be created via control points, creep routing, or objective timing

Model A is recommended for MVP because it is cleaner, easier to balance, and easier to network.

## Core gameplay pillars

1. Placement matters
2. Upgrade timing matters
3. Damage-type and utility composition matters
4. Economy tradeoffs matter
5. Pressure timing matters
6. Adaptation to the current wave/game state matters

## AI play requirements

Bot opponents should not rely on hidden resource cheats.
Instead they should differ through:
- build preferences
- risk tolerance
- pressure timing
- defensive posture
- reaction quality
- adaptation quality

## Match structure, draft baseline

- pre-match loadout or faction pick
- short warmup / ready flow
- wave progression or round cadence
- escalating pressure
- win/loss through survival, leak differential, score race, or collapse state depending on final ruleset

## MVP recommendation

For MVP, keep the rules narrow:
- one map
- one primary game mode
- a compact tower roster
- a compact enemy roster
- one or two pressure mechanics only
