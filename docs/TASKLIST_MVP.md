# Lil8TD MVP Tasklist

## Goal

Create a first playable MVP foundation for Lil8TD with:
- one playable solo slice
- one AI bot
- one online 1v1 slice through MultiWebCore

## Phase 0, framing and decisions
- [ ] lock the MVP PvP model
- [ ] lock the initial win/loss rule
- [ ] decide whether active abilities are in MVP
- [ ] define initial tower roster
- [ ] define initial enemy roster
- [ ] define initial loadout/faction structure
- [ ] define one map format

## Phase 1, project skeleton
- [ ] create project app scaffold
- [ ] add source folder structure
- [ ] set up build tooling
- [ ] set up test runner
- [ ] set up lint/format baseline
- [ ] create version/config surface

## Phase 2, simulation core
- [ ] fixed tick loop
- [ ] deterministic time-step discipline
- [ ] tile/lane map representation
- [ ] placement legality system
- [ ] enemy spawn system
- [ ] path progression system
- [ ] target acquisition system
- [ ] damage/combat resolution
- [ ] economy system
- [ ] build/upgrade/sell flows
- [ ] loss/win resolution

## Phase 3, content v0
- [ ] implement 6 to 8 towers
- [ ] implement 6 to 10 enemies
- [ ] implement one map
- [ ] implement one wave progression
- [ ] implement 2 to 3 loadout packages
- [ ] write initial balance data definitions

## Phase 4, UI and rendering
- [ ] camera and board rendering
- [ ] tower placement preview
- [ ] range preview
- [ ] tower info panel
- [ ] upgrade/sell controls
- [ ] enemy trait readability
- [ ] economy and danger HUD
- [ ] match result screen

## Phase 5, AI bot
- [ ] baseline placement heuristic
- [ ] baseline upgrade heuristic
- [ ] baseline adaptation to enemy mix
- [ ] pressure timing heuristic
- [ ] easy bot profile
- [ ] medium bot profile
- [ ] hard bot profile

## Phase 6, testing and simulation harness
- [ ] deterministic simulation smoke tests
- [ ] placement legality tests
- [ ] economy legality tests
- [ ] combat correctness tests
- [ ] AI smoke tests
- [ ] offline bot-vs-bot harness

## Phase 7, networking via MultiWebCore
- [ ] define Lil8TD command payload mapping
- [ ] integrate MWC client boundary
- [ ] room create/join flow
- [ ] ready/start flow
- [ ] canonical command submission path
- [ ] match result sync path
- [ ] reconnect baseline
- [ ] compatibility/version checks

## Phase 8, polish pass
- [ ] balance pass on towers and enemies
- [ ] pressure mechanic tuning
- [ ] pacing pass
- [ ] clarity pass on HUD and feedback
- [ ] diagnostics pass for online failures

## Good first implementation milestone
- [ ] local playable board with one map
- [ ] three towers
- [ ] three enemy types
- [ ] one bot
- [ ] build/upgrade/sell working
- [ ] deterministic smoke tests passing

## Good first online milestone
- [ ] two clients join one room
- [ ] both ready
- [ ] match starts cleanly
- [ ] canonical tower build command works
- [ ] canonical upgrade command works
- [ ] match ends cleanly
