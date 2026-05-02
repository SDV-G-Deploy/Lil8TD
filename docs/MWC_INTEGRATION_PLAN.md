# Lil8TD MultiWebCore Integration Plan

## Purpose

This document defines how Lil8TD should integrate with MultiWebCore for online 1v1.
The goal is to keep networking reusable and stable while keeping Lil8TD game-specific semantics cleanly separated.

## Core boundary

### MultiWebCore owns
- connection/session establishment
- room create/join/leave
- ready state flow
- match allocation and startup barrier
- canonical tick numbering
- input envelope acceptance/rejection
- reconnect lifecycle
- close reasons and protocol errors

### Lil8TD owns
- command semantics
- tower legality
- loadout rules
- economy rules
- pressure mechanics
- simulation state evolution
- match result semantics
- user-facing game feedback

## MVP integration assumptions

- mode: online 1v1 only
- transport: WSS via MultiWebCore
- server model: dedicated match runtime
- game model: server-relayed canonical input flow
- Lil8TD sim remains game-owned

## Required Lil8TD client capabilities

Lil8TD should consume an adapter/client surface that can:
- connect
- create room
- join room
- leave room
- set ready
- observe room state
- observe match state
- submit future-tick inputs
- observe canonical tick commits
- handle reconnect and close events

## Match lifecycle target

### Pre-match
1. connect
2. establish session
3. create or join room
4. choose loadout if supported in pre-start phase
5. set ready
6. receive match allocation/start flow

### In-match
1. receive match parameters
2. enter canonical tick loop
3. submit Lil8TD commands for future ticks
4. receive canonical committed inputs
5. apply simulation updates locally
6. surface lifecycle/network state to the UI

### Match end
1. receive final result
2. stop accepting active gameplay commands
3. show result state
4. clear or recycle room state for rematch flow later

## Lil8TD command mapping

Expected initial command set:
- `loadout.pick`
- `tower.build`
- `tower.upgrade`
- `tower.sell`
- `ability.cast` if abilities exist in MVP
- `pressure.send`

## Required compatibility checks

Before match start, the integration should validate compatible:
- game version
- content version
- map version
- ruleset version
- loadout rules version if needed

Do not start live lockstep-style play on ambiguous mixed content.

## Reconnect baseline

Lil8TD should support the MWC reconnect lifecycle as a first-class UI state.

Minimum behavior:
- show reconnecting state clearly
- stop accepting unsafe gameplay actions while disconnected
- attempt resume via MWC path
- recover into live state if canonical recovery succeeds
- surface terminal close reasons clearly if recovery fails

## Recommended implementation order

### Step 1. Local integration boundary
Create a narrow `src/net/` interface inside Lil8TD so game code never talks directly to raw transport primitives.

### Step 2. Room/match lifecycle wiring
Implement room create/join/ready/start UI and lifecycle state mapping.

### Step 3. Canonical gameplay command flow
Route Lil8TD commands through the MWC future-tick submit path and consume canonical tick commits.

### Step 4. Result and terminal-state handling
Cleanly surface match end, disconnect, and protocol failure states.

### Step 5. Reconnect baseline
Implement minimum useful reconnect behavior and state exposure.

## Test goals

Need integration tests proving:
- two clients can connect to one room
- both can ready and start
- canonical `tower.build` works
- canonical `tower.upgrade` works
- terminal match result is surfaced cleanly
- disconnect/reconnect baseline does not leave the client in ambiguous state

## Anti-goals

- do not let Lil8TD UI scatter transport assumptions everywhere
- do not let game logic depend on raw websocket messages
- do not revive peer-to-peer assumptions for MVP
- do not weaken version compatibility discipline just to get a faster demo
