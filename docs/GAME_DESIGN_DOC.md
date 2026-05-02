# Lil8TD Game Design Document

## 1. High concept

Lil8TD is a compact top-down pixel-style competitive tower defense game.
It is designed around readable systems, deterministic-friendly simulation, solo bot play, and online 1v1.

The MVP target is not huge content volume.
The MVP target is a small but sharp game with clean foundations.

## 2. Core fantasy

The player should feel like:
- an efficient battlefield engineer
- a pressure-aware defender
- a tactician making build and timing choices under escalating threat

The game should create satisfaction through:
- strong placement decisions
- clutch defense holds
- clever upgrade timing
- adaptation to enemy composition and wave pressure
- outplaying the opponent through systems, not frantic micro

## 3. Genre framing

Lil8TD is not a passive idle defense game.
It is an active competitive tower defense game with meaningful PvP pressure.

The recommended MVP structure is a mirrored dual-board format:
- each player has their own board/lane space
- each player builds and upgrades towers on their side
- each player survives wave pressure on their side
- each player can generate pressure against the opponent indirectly through controlled systems

## 4. Match goals

A match should reward:
- good placement
- efficient upgrade sequencing
- threat recognition
- economy timing
- pressure timing
- adaptation to current board state

A match should not require:
- RTS-level unit micro
- unreadable UI density
- hidden numerical knowledge to be playable

## 5. MVP game loop

### Macro loop
1. enter room / start solo match
2. choose loadout or faction package
3. begin early defensive setup
4. survive recurring enemy pressure
5. spend economy on towers, upgrades, and selective pressure actions
6. react to scaling threat and opponent decisions
7. win through stronger survival/performance under pressure

### Micro loop
1. inspect lanes and threat path
2. place or upgrade a tower
3. watch interaction outcome
4. identify weakness or opportunity
5. adjust build plan
6. decide whether to invest in defense, greed, or pressure

## 6. Win condition candidates

### Preferred MVP candidate
- loss occurs when leak damage or life collapse reaches a terminal threshold
- winner is the player who survives longer or forces the opponent to collapse first

### Alternative candidate
- score race across fixed rounds/waves

Recommendation:
Use survival-collapse rules first.
They are easier to read, easier to feel, and easier to present in MVP.

## 7. Core systems

### 7.1 Economy
Need a compact economy model that supports:
- tower placement
- upgrades
- strategic tradeoffs
- pressure actions

Recommended MVP economy:
- one primary currency
- optional secondary pacing resource only if clearly justified

Do not overcomplicate economy in MVP.

### 7.2 Towers
Tower roster should be compact but strategically distinct.

Recommended tower roles:
- basic sustained DPS tower
- anti-swarm tower
- anti-heavy tower
- slowing/control tower
- support/buff tower
- high-cost spike tower

### 7.3 Enemies
Enemy roster should drive adaptation.

Recommended enemy categories:
- basic runner
- tanky brute
- swarm unit
- shielded unit
- fast leak threat
- support/aura enemy
- split-on-death or resistant variant later if justified

### 7.4 Pressure mechanics
PvP pressure should be meaningful but not degenerate.

Recommended MVP pressure mechanics:
- send additional enemy pack
- choose stronger enemy variant for a cost

Avoid too many pressure mechanics in MVP.
Two good ones are enough.

### 7.5 Loadouts or faction packages
A lightweight pre-match identity layer can improve replayability.

Recommendation for MVP:
- 2 or 3 compact loadout packages
- each changes available towers or biases economy/pressure style

This gives strategic identity without needing huge content.

## 8. Difficulty and AI

Bot AI should scale through behavior quality, not cheats.

Behavior dimensions:
- placement quality
- economy discipline
- upgrade timing
- response to armor/swarm/heavy threats
- pressure timing
- panic resistance under leaks

Bot personalities could include:
- stable defender
- greedy scaler
- tempo aggressor

## 9. Match pacing goals

### Early game
- clear setup decisions
- no instant overwhelm
- meaningful first placements

### Mid game
- composition adaptation matters
- upgrades become real timing calls
- pressure choices become sharper

### Late game
- strong build planning matters
- specialized defenses are tested
- pressure windows become decisive

## 10. Clarity goals

The game must clearly communicate:
- lane path
- tower range
- target priority if relevant
- enemy traits
- pressure events
- leak danger
- current economy state

If the player cannot quickly read why they are losing, the design is failing.

## 11. MVP content recommendation

- 1 map
- 1 primary competitive mode
- 6 to 8 towers
- 6 to 10 enemies
- 2 to 3 loadout packages
- 1 to 3 bot profiles
- 1 to 2 pressure mechanics

## 12. Anti-goals

- do not turn MVP into an RTS hybrid too early
- do not add huge tower count before interaction clarity exists
- do not rely on raw APM as the skill ceiling
- do not build around hidden AI boosts
- do not overdesign lore/faction surface before systems work
