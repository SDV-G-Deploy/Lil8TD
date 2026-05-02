# Lil8TD MVP Roadmap

## MVP goal

Ship a compact but real playable tower defense prototype with:
- AI bot support
- online 1v1 support
- deterministic-friendly simulation
- pixel-style top-down presentation

## Stage 0, documentation and framing
- define vision
- define architecture
- define gameplay model
- define reuse boundaries from LW2B and MWC
- choose the primary PvP model

## Stage 1, simulation foundation
- fixed-tick simulation skeleton
- map format
- enemy path model
- tower placement legality
- combat/projectile/status-effect basics
- economy and upgrade rules
- deterministic test harness

## Stage 2, playable solo slice
- one map
- 6 to 8 tower types
- 6 to 10 enemy types
- one complete wave progression
- one AI bot profile
- basic HUD and placement UX
- win/loss flow

## Stage 3, online 1v1 slice
- MWC transport integration
- room create/join/ready/start flow
- canonical command path
- reconnect baseline
- match end/results flow
- lifecycle and protocol diagnostics

## Stage 4, competitive polish
- more bot personalities
- balancing pass
- match pacing pass
- pressure-mechanic tuning
- better clarity and feedback
- replay/debug hooks if justified

## Non-goals for MVP
- huge content roster
- co-op multiplayer
- mobile-first optimization
- broad cosmetic systems
- spectator platform
- large live-service backend surface
