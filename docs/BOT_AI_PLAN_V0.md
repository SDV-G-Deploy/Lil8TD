# Lil8TD Bot AI Plan v0

## Purpose

This document defines the first practical AI design for Lil8TD bots.
The goal is to build opponents that feel intentional, readable, and progressively stronger without relying on cheats.

## AI product role

Bots must support:
- solo play
- balance validation
- simulation harnesses
- later online testing fallback when a human opponent is unavailable

## Design stance

Bots should win through:
- better placement
- better upgrade timing
- better adaptation
- smarter pressure timing
- stronger recovery discipline

Bots should not win through:
- hidden resource inflation
- hidden cooldown bypasses
- fake legality exceptions

## Core AI model

Recommended architecture:
- deterministic-friendly state and evaluation logic
- posture/intent layer above raw actions
- compact heuristic system first
- narrow, testable behavior modules

## Primary decision layers

## 1. Economy posture
Bot should maintain a current economic posture:
- `stable`
- `greed`
- `recover`
- `fortify`

### Meaning
- `stable` , balanced spending
- `greed` , push for scaling/economic efficiency
- `recover` , stabilize after leaks or bad board state
- `fortify` , defend against upcoming hard threat or own weak lane

## 2. Build intent
Bot should decide what problem it is solving:
- anti-swarm gap
- anti-heavy gap
- leak patch
- scaling setup
- synergy amplification

This is more important than just "buy cheapest legal thing".

## 3. Pressure intent
Bot should decide whether to pressure now:
- `hold`
- `probe`
- `commit`
- `snowball`

### Meaning
- `hold` , no offensive spend, stabilize own board
- `probe` , small test pressure
- `commit` , meaningful spend to exploit a timing window
- `snowball` , convert advantage into continued pressure

## 4. Recovery discipline
Bot needs explicit recovery logic.
If leaks or underbuilt lane state occur, it must:
- prioritize patching danger
- stop self-sabotaging greed
- avoid random alternating decisions

## Bot inputs for evaluation

Bot should evaluate at minimum:
- current resources
- tower coverage per lane zone
- enemy composition mix
- current leak risk
- current wave stage
- efficiency of existing kill-zones
- recent pressure outcome if PvP pressure is active

## Tower decision priorities

When choosing build/upgrade actions, the bot should ask:
1. am I about to leak badly
2. do I lack swarm coverage
3. do I lack heavy coverage
4. can a support/control placement multiply existing value
5. is a major upgrade timing stronger than a new cheap tower
6. can I afford offensive pressure without opening a lethal weakness

## Difficulty model

## Easy
- slower decision cadence
- prefers safe baseline builds
- underuses pressure
- weaker adaptation to enemy type mix
- recovers but not optimally

## Medium
- balanced baseline opponent
- uses coherent build progression
- uses reasonable pressure windows
- adapts to major roster threats

## Hard
- stronger synergy recognition
- better timing exploitation
- more consistent patching of weak spots
- more dangerous pressure conversion
- less wasteful spending

## Personality profiles

Difficulty and personality should not be identical.
Recommended starter personalities:

### 1. Stable Defender
- safer growth
- strong recovery discipline
- lower offensive risk

### 2. Greedy Scaler
- invests into efficiency and synergy earlier
- vulnerable if punished correctly
- dangerous if left alone

### 3. Tempo Aggressor
- earlier pressure windows
- more willing to test weak defense
- slightly riskier self-defense posture

## Implementation order

### Phase 1
- legal action generation
- baseline build heuristic
- baseline upgrade heuristic
- leak recovery heuristic

### Phase 2
- composition recognition for enemy mix
- pressure timing heuristic
- posture memory across short windows

### Phase 3
- personality profiles
- deeper synergy evaluation
- better bad-trade avoidance

## Testing requirements

Need tests for:
- bot does not choose illegal placement
- bot responds to swarm-heavy state with anti-swarm correction
- bot responds to heavy-wave state with anti-heavy correction
- bot enters recovery after bad leaks
- bot does not pressure recklessly when own collapse risk is high

## Anti-goals

- do not build an opaque black-box AI first
- do not hide cheating bonuses under difficulty labels
- do not make hard AI simply spam inputs faster
- do not collapse every bot personality into the same tower script
