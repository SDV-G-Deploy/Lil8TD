# Lil8TD First Implementation Milestone

## Purpose

This document defines the first concrete implementation target after documentation bootstrap.
The goal is to create the smallest build that proves the project is real and correctly shaped.

## Milestone name

`Local Playable Foundation`

## Success definition

The milestone is successful if Lil8TD can do all of the following locally:
- run one playable map
- spawn enemy waves
- allow tower placement
- allow tower upgrades
- resolve damage and leaks
- end in win/loss state
- support one baseline AI bot or scripted autoplayer for validation
- pass initial deterministic smoke tests

## Scope

### Included
- app scaffold
- fixed tick loop
- map representation
- lane/path representation
- 3 initial tower types
- 3 initial enemy types
- one economy loop
- build/upgrade/sell flow
- one result condition
- one baseline bot
- smoke tests

### Excluded
- online multiplayer
- reconnect
- polished art pipeline
- large content roster
- advanced pressure system
- multiple maps

## Recommended initial content

### Towers
1. Arrow Tower
2. Burst Tower
3. Frost Tower

This set is enough to test:
- single-target coverage
- anti-swarm response
- control synergy

### Enemies
1. Grunt
2. Runner
3. Brute

This set is enough to test:
- baseline damage race
- leak pressure
- anti-heavy requirement

## Required systems

### Simulation systems
- fixed tick update loop
- wave spawn scheduling
- enemy lane progression
- tower target acquisition
- attack timing
- damage resolution
- slowing support if Frost exists in milestone
- economy reward/spend flow
- lose/win condition

### UX systems
- board render
- tower placement preview
- upgrade/sell interaction
- basic HUD for currency, lives, wave state
- visible result state

### Validation systems
- deterministic simulation smoke test
- placement legality test
- simple combat correctness test
- bot action legality test

## Suggested implementation order

1. project scaffold
2. fixed tick skeleton
3. board and path representation
4. enemy movement
5. tower placement legality
6. targeting and attack loop
7. economy + win/loss
8. initial bot
9. tests and stabilization

## Exit criteria checklist

- [ ] one local map playable from start to finish
- [ ] three towers working
- [ ] three enemies working
- [ ] build/upgrade/sell works without obvious state bugs
- [ ] losing state is readable
- [ ] bot or autoplayer can complete a basic simulation pass
- [ ] initial smoke tests are green

## Why this milestone matters

This milestone proves:
- the game loop is real
- the architecture is not fake-doc-only
- the content model is viable
- bot and net work can build on a stable base later
