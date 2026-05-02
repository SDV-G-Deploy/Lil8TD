# Lil8TD MVP Scope Decisions

## Purpose

This file freezes the first practical MVP scope choices so implementation does not drift into a too-large first release.
It does not replace the wider design docs; it narrows them into an execution baseline.

## Locked baseline for first implementation

### PvP model
Use **mirrored dual-board competitive TD**.

Each player has their own defensive board, survives wave pressure locally, and can create indirect pressure against the opponent through controlled systems.
Do not pursue shared-map split-field play for MVP.

### First win/loss rule
Use **survival-collapse** first.

A player loses when leak/life damage reaches a terminal threshold. In PvP, the winner is the player who forces opponent collapse or survives longer if a terminal comparison is needed.
Do not start with score-race rules unless survival-collapse proves unreadable.

### Active abilities
Keep active abilities **out of the first local playable foundation**.

The command protocol may keep `ability.cast` as a future-compatible candidate, but implementation should not depend on abilities until the core tower/economy/pressure loop is proven.

### Pressure mechanics
Start with **one pressure mechanic**:
- send an additional enemy pack for a defined cost/resource.

Delay temporary debuffs, economy stress, lane events, and multiple pressure variants until the basic pressure loop is testable and readable.

### Content ladder
Avoid treating the full content target as the first implementation target.

Recommended ladder:
1. Local playable foundation: 3 towers, 3 enemies, 1 map, 1 scripted/baseline bot.
2. Solo MVP slice: 6 core towers, 6-8 enemies, 2-3 loadouts, 1 complete wave progression.
3. Online MVP slice: 1v1 through MultiWebCore using the already-proven local sim and command set.

### Networking order
Do not start online integration before the local simulation can complete deterministic smoke tests.

MultiWebCore integration should begin after:
- fixed tick loop exists
- build/upgrade/sell commands are validated by sim
- one map and wave progression run to result
- command serialization and replay are stable enough for tests

## Main scope guardrail

The MVP is successful if it proves a clean, replayable competitive TD loop.
It does not need broad content, multiple maps, advanced abilities, cosmetics, spectator features, or a large live-service surface.
