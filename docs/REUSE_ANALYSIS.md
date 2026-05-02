# Lil8TD Reuse Analysis

## Summary

Lil8TD should reuse the strongest foundations from two prior projects:
- `LittleWarCraft2but` (LW2B)
- `MultiWebCore` (MWC)

The reuse should be selective.
Lil8TD is a new game, not a direct derivative of LW2B.

## What to reuse from LW2B

### Reuse strongly
- deterministic simulation discipline
- separation of `sim`, `render`, `net`, `data`, and `balance`
- test-first thinking for simulation behavior
- offline simulation / observer-style validation
- data-driven balance and tuning structure
- AI posture/intent architecture
- legality parity between UI and simulation
- version/content pinning mindset for multiplayer correctness

### Reuse as reference, not as direct carryover
- pathing and movement patterns
- renderer/UI layout patterns
- combat pacing patterns
- map/control-pressure ideas

### Do not reuse directly
- RTS-specific worker economy
- base construction assumptions
- army micro/control model
- peer-oriented historical transport assumptions
- faction logic that only makes sense in RTS form

## What to reuse from MultiWebCore

### Reuse strongly
- room lifecycle
- match lifecycle
- connection lifecycle
- reconnect lifecycle
- canonical tick/input flow
- WSS dedicated-server transport model
- protocol versioning discipline
- observability and error-code structure
- client/core boundary discipline

### Adapt for Lil8TD
- game-specific command payloads
- reconnect/resync data shape
- match result semantics
- loadout/faction/map metadata checks

## Practical conclusion

### LW2B role
LW2B is the source of:
- gameplay-system engineering discipline
- deterministic simulation lessons
- AI and balance architecture patterns

### MWC role
MWC is the source of:
- multiplayer backbone
- room/session/match runtime model
- canonical online flow and lifecycle state discipline

### Lil8TD role
Lil8TD should define its own:
- tower defense simulation core
- build/upgrade/enemy systems
- PvP pressure mechanics
- visual/game-feel identity
