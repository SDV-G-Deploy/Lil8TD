# Lil8TD Architecture

## High-level architecture

Lil8TD should be split into two major layers:

1. game-specific runtime
2. multiplayer platform runtime

## 1. Game-specific runtime

Recommended project areas:

- `src/sim/` , core tower defense simulation
- `src/data/` , towers, enemies, maps, waves, loadouts, modifiers
- `src/balance/` , formulas, costs, reports, tuning
- `src/ai/` or `src/sim/ai.ts` , bot logic and difficulty behavior
- `src/render/` , pixel renderer, HUD, placement previews, combat feedback
- `src/game/` , top-level game flow and mode wiring
- `src/net/` , thin integration boundary into MultiWebCore

## 2. Multiplayer platform runtime

MultiWebCore should own:
- connection/session establishment
- room create/join/leave
- ready flow
- match start barrier
- canonical tick numbering
- input envelope acceptance/rejection
- reconnect lifecycle
- close reasons and protocol errors

Lil8TD should own:
- command semantics
- tower legality rules
- enemy/wave behavior
- simulation state updates
- game-specific result resolution
- client-side presentation and feedback

## Simulation stance

Recommended default:
- fixed tick simulation
- deterministic rules whenever possible
- version/content pinning per match
- no UI-timing side effects in authoritative sim path
- controlled randomness only

## Candidate network command families

Examples:
- `tower.build`
- `tower.upgrade`
- `tower.sell`
- `ability.cast`
- `pressure.send`
- `loadout.pick`
- `ready.confirm`

## Recommended online model

For MVP:
- dedicated server via MultiWebCore
- server-relayed canonical input flow
- 1v1 only
- explicit reconnect state
- no peer-to-peer dependency

## Testing model

Lil8TD should support:
- local deterministic simulation tests
- AI-vs-AI offline simulation tests
- balance smoke tests
- network integration tests through MultiWebCore
- match lifecycle tests for create/join/ready/start/end
