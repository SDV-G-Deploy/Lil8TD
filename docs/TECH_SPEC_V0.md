# Lil8TD Technical Specification v0

## 1. Purpose

This document defines the initial technical direction for Lil8TD.
It is meant to keep implementation clean, deterministic-friendly, and compatible with online 1v1 through MultiWebCore.

## 2. Technical goals

- fixed-tick game simulation
- deterministic-friendly rules and data flow
- strong separation between simulation, rendering, and networking
- offline testability
- online 1v1 through server-relayed canonical input flow
- compact MVP architecture with room to grow

## 3. Proposed repository structure

```text
src/
  ai/
  balance/
  data/
  game/
  net/
  render/
  sim/
  ui/
```

Recommended details:

- `src/sim/` , authoritative gameplay logic on client side
- `src/data/` , maps, towers, enemies, waves, loadouts
- `src/balance/` , formulas, costs, resolver, tuning reports
- `src/ai/` , bot behavior logic
- `src/net/` , MWC integration adapter and command mapping
- `src/render/` , pixel rendering and VFX-friendly visual layer
- `src/ui/` , HUD, panels, tooltips, drag/place interactions
- `src/game/` , orchestration and mode wiring

## 4. Simulation model

### Requirements
- fixed simulation tick
- stable application order
- no authoritative dependence on UI timing
- deterministic command interpretation
- controlled randomness only

### Recommended baseline
- simulation rate in a compact stable range, for example 10 to 20 Hz for core gameplay sim
- rendering decoupled from simulation step
- tower attack cadence derived from tick time, not frame time

## 5. Data model areas

### Towers
Each tower definition should carry at minimum:
- id
- name
- cost
- build restrictions
- upgrade paths
- range
- rate of fire
- damage profile
- targeting rules
- special modifiers/status effects

### Enemies
Each enemy definition should carry at minimum:
- id
- name
- speed
- health
- armor or resistance tags
- reward value
- path behavior flags
- special traits

### Waves
Each wave definition should carry:
- wave index
- spawn groups
- timing offsets
- modifiers
- reward payout
- optional pressure-source metadata

### Loadouts
Each loadout package should define:
- allowed towers
- passive modifiers if any
- identity text and UI framing

## 6. Core simulation subsystems

### Placement legality
Must answer:
- can a tower be placed here
- does it violate tile/path constraints
- does it overlap blocked space
- is the player allowed this tower in current loadout

### Path model
MVP should prefer a simple and reliable path model.
Recommended options:
- predefined lane graph
- tile route with constrained recompute

Avoid overengineering freeform pathfinding in the first pass.

### Combat
Needs to support:
- target acquisition
- attack cadence
- projectile or instant-hit resolution
- resistances and modifiers
- status effects like slow if used

### Economy
Needs to support:
- spending on build/upgrade
- rewards from wave handling
- pressure action spending
- clean failure messages for illegal actions

### Match result
Needs to support:
- life/leak collapse state
- winner/loser resolution
- end-state summary

## 7. Networking model

### Online architecture
- MultiWebCore owns connection, room, match, reconnect, and canonical tick/input lifecycle
- Lil8TD owns game command meaning and simulation results

### Match assumptions
- 1v1 only for MVP
- dedicated server via MWC
- future-tick input submission
- canonical tick commits from server
- same game/data version required for match start

### Required metadata checks
Before match start, the client should be able to assert compatibility for:
- game version
- content version
- map version
- loadout ruleset version

## 8. Command model

Commands should be compact and explicit.

Candidate commands:
- build tower
- upgrade tower
- sell tower
- cast ability
- send pressure pack
- choose loadout
- ready confirm

Command validity should be checked at two levels:
- envelope/timing validity via MWC/core path
- gameplay legality via Lil8TD simulation path

## 9. AI model

Bot logic should be data-driven where possible.

MVP AI responsibilities:
- choose placements
- choose upgrades
- respond to enemy type mix
- choose pressure timing
- recover from leaks without obvious panic collapse

## 10. Testing requirements

### Required test classes
- deterministic sim tests
- placement legality tests
- wave/combat tests
- AI decision smoke tests
- content resolver tests
- online room/match lifecycle integration tests
- network command mapping tests

### Strongly recommended later
- state hash checkpoints
- offline bot-vs-bot simulation harness
- resync/reconnect recovery tests

## 11. Non-goals for v0

- rollback architecture
- broad co-op support
- generalized modding layer
- mobile optimization first
- spectator system
- procedural everything
