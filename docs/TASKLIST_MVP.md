# Lil8TD MVP Tasklist

> Progress note: the demo-vs-AI milestone (see `DEMO_SCRIPT.md`) ships 5 towers and 6 enemies
> (content ladder step between "local foundation" and "solo MVP slice"), one map, one 10-wave
> progression, three bot profiles and a bot-vs-bot harness. Loadouts and networking remain open.

## Goal

Create a first playable MVP foundation for Lil8TD with:
- one playable solo slice
- one AI bot
- one online 1v1 slice through MultiWebCore

## Phase 0, framing and decisions
- [x] lock the MVP PvP model
- [x] lock the initial win/loss rule
- [x] decide whether active abilities are in MVP
- [x] define initial tower roster
- [x] define initial enemy roster
- [ ] define initial loadout/faction structure
- [x] define one map format

## Phase 1, project skeleton
- [x] create project app scaffold
- [x] add source folder structure
- [ ] set up build tooling
- [x] set up test runner
- [ ] set up lint/format baseline
- [ ] create version/config surface

## Phase 2, simulation core
- [x] fixed tick loop
- [x] deterministic time-step discipline
- [x] tile/lane map representation
- [x] placement legality system
- [x] enemy spawn system
- [x] path progression system
- [x] target acquisition system
- [x] damage/combat resolution
- [x] economy system
- [x] build/upgrade/sell flows
- [x] loss/win resolution

## Phase 3, content v0
- [ ] implement 6 to 8 towers
- [ ] implement 6 to 10 enemies
- [x] implement one map
- [x] implement one wave progression
- [ ] implement 2 to 3 loadout packages
- [x] write initial balance data definitions

## Phase 4, UI and rendering
- [x] camera and board rendering
- [x] tower placement preview
- [x] range preview
- [x] tower info panel
- [x] upgrade/sell controls
- [x] enemy trait readability
- [x] economy and danger HUD
- [x] match result screen

## Phase 5, AI bot
- [x] baseline placement heuristic
- [x] baseline upgrade heuristic
- [x] baseline adaptation to enemy mix
- [x] pressure timing heuristic
- [x] easy bot profile
- [x] medium bot profile
- [x] hard bot profile

## Phase 6, testing and simulation harness
- [x] deterministic simulation smoke tests
- [x] placement legality tests
- [x] economy legality tests
- [x] combat correctness tests
- [x] AI smoke tests
- [x] offline bot-vs-bot harness

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
- [x] local playable board with one map
- [x] three towers
- [x] three enemy types
- [x] one bot
- [x] build/upgrade/sell working
- [x] deterministic smoke tests passing

## Good first online milestone
- [ ] two clients join one room
- [ ] both ready
- [ ] match starts cleanly
- [ ] canonical tower build command works
- [ ] canonical upgrade command works
- [ ] match ends cleanly
