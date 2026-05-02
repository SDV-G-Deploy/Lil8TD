# Lil8TD Economy Model V0

## Purpose

This document fixes the first economy model for Lil8TD before coding.
It defines how resources enter and leave the match, and how economy creates the core choices between defense, greed, upgrades, and PvP pressure.

The economy should make each spend feel intentional without becoming a separate management game.
It supports the MVP competitive loop; it is not the whole game.

## Why V0 starts simple

V0 should start with a simple, readable economy because the project first needs to prove:
- deterministic local simulation
- survival-collapse pacing
- mirrored dual-board PvP pressure
- bot decisions around build, upgrade, and pressure
- clear player understanding of why a board stabilized or collapsed

Complex economy layers would hide balance problems inside bookkeeping.
A single clear currency lets early tests answer the important question: are the core TD and pressure choices already interesting?

## Baseline economy model

### Primary resource

V0 uses **one main currency**.

This same currency pays for:
- tower builds
- tower upgrades
- pressure sends

Reason:
- easiest to read
- directly connects pressure to defensive opportunity cost
- reduces UI and rules burden
- fits the simulation contract's command-phase spending model

No separate pressure resource, income token, interest bank, or upkeep resource is required for V0.

### Income sources

Currency enters the match through three sources:

1. **Starting currency**
   - enough to build a valid early defense
   - not enough to solve several waves without further income decisions

2. **Kill rewards**
   - paid when enemies are killed
   - paid once per enemy in the economy phase
   - leaked enemies do not pay kill rewards

3. **Wave payouts / completion rewards**
   - scheduled pacing income tied to waves
   - paid in the economy phase
   - can be wave-start, wave-clear, or fixed cadence, but each payout must be explicit in ruleset data

Recommended V0 default:
- small kill rewards for moment-to-moment feedback
- larger wave-clear or wave-cadence payouts for stable pacing

This avoids making every missed kill an unrecoverable economic disaster.

### Kill rewards

Kill rewards should matter, but they must not create runaway snowball.

Rules:
- each enemy type has a small pinned reward value
- rewards are deterministic and data-defined
- reward is paid only after death resolution
- currency earned from kills this tick is not available to commands earlier in the same tick

Design intent:
- good defense is rewarded
- leaks are painful because they cost lives and missed rewards
- one bad wave should hurt without ending the match economically by itself

### Wave payouts / completion rewards

Wave payouts are the main pacing tool.

V0 should prefer one of these simple shapes:

- **Wave-clear payout:** reward when all normal wave enemies are cleared.
- **Scheduled wave-start payout:** reward at the beginning of each wave/prep window.
- **Fixed cadence payout:** reward every defined number of ticks or between waves.

Recommended first balance path:
- use wave-start or wave-clear payouts as the main income backbone
- keep kill rewards smaller
- avoid interest-like banking bonuses

If wave-clear payout makes struggling players fall too far behind, switch more value into scheduled pacing payouts.

### Build costs

Building a tower spends full cost during command application.

V0 cost roles:
- cheap tower: early filler / emergency coverage
- core tower: normal strategic baseline
- support/control tower: synergy investment, usually not enough alone
- anchor tower: expensive stabilizer or late power spike

Build costs should make early placement decisions meaningful, but never trap a new player into instant loss from one reasonable opening.

### Upgrade costs

Upgrades spend currency during command application.

V0 upgrade philosophy:
- upgrades improve commitment and efficiency
- upgrades should compete with widening coverage
- early upgrades should not completely replace map coverage
- late upgrades can create stronger identity and tempo windows

Recommended structure:
- level 1 build is the readable unit
- first upgrade is a meaningful but reachable commitment
- later upgrade/anchor tiers are expensive enough to delay pressure or expansion

### Sell / refund

Selling applies an immediate refund during command application for first foundation.

V0 refund should be useful but not abusable.

Recommended refund range:
- **50-75%** of build cost baseline
- lower refund for upgrades unless testing proves it feels too punishing
- never 100% refund by default

Design intent:
- allow recovery from bad placement or pressure response
- allow tactical adjustment
- prevent free reposition loops and perfect scouting refunds

If upgrade refunds are included, define them explicitly as part of tower value, not as an implicit full resale of every spend.

### Pressure spending

Pressure uses the same main currency.

A `pressure.send` is therefore a real tradeoff:
- spend now to stress opponent
- delay own tower/upgrade
- risk being thin if the send fails or arrives at a bad timing

Pressure should not have direct economy sabotage in V0.
Its economic impact should come from forcing the opponent into inefficient defense, emergency spending, leaks, or missed greed timing.

## Design goals

### Readable

Players should understand:
- how much currency they have
- what actions cost
- why they gained currency
- why pressure spending delayed their own defense

### Meaningful tradeoffs

The same resource must support multiple valid uses:
- stabilize now
- upgrade for efficiency
- widen coverage
- save for an anchor
- send pressure

### Low bookkeeping burden

The player should not manage several invisible ledgers.
Economy decisions should come from board state and timing, not accounting chores.

### Support tempo windows

Economy should create moments where spending now matters:
- just before a hard wave
- during a prep gap
- after clearing efficiently
- when opponent is visibly greedy or under-covered

### Punish bad greed without forcing permanent passivity

Greedy play should be punishable, especially by pressure timing.
But one punished greed moment should not automatically remove all future agency.
Recovery must remain possible through smart spending, selling, and safer pacing income.

## Intended tensions

### Build now vs save

Building now improves safety and coverage.
Saving keeps options open for a stronger tower, key upgrade, or pressure timing.

### Upgrade now vs widen defense

Upgrading improves efficiency around an existing kill zone.
Widening defense covers leaks, mixed waves, and pressure overlap.

### Pressure now vs stabilize own board

Pressure can create opponent stress, but it spends the same currency that could protect the sender.
A failed send should leave a visible tempo cost.

### Safe play vs greedy scaling

Safe play reduces leak risk and handles surprise pressure better.
Greedy scaling can reach stronger timings, but should be vulnerable to well-timed sends and difficult waves.

## V0 guardrails

- No complex multi-currency economy at start.
- No interest banking layer.
- No passive income trees.
- No pressure-only resource unless single-currency pressure proves unusable.
- No snowball runaway through huge kill rewards.
- No reward loop where pressure directly funds more pressure.
- No overly generous refund loops that make placement risk meaningless.
- No hidden economy bonuses that opponents cannot understand.
- No strategy should be mathematically best in every normal situation.
- Do not balance around perfect play; the model must survive normal mistakes.

## Rough numeric framing

These are starting proportions, not final balance.

Assume a cheap early tower cost of `1.0x`.

Suggested relative cost tiers:
- cheap filler tower: `1.0x`
- core tower: `1.5-2.5x`
- support/control tower: `2.0-3.0x`
- first meaningful upgrade: `1.0-2.0x` of that tower's build cost
- anchor tower: `4.0-6.0x`

Pressure cost idea:
- basic pressure pack: roughly comparable to a cheap tower or first small upgrade
- stronger pressure pack later: comparable to delaying a core tower or key upgrade
- pressure should be expensive enough that failed timing matters

Refund idea:
- tower sell refund: `50-75%` of relevant refundable value
- start testing around `60-70%`
- avoid full upgrade refunds unless there is a specific balance reason

Payout cadence idea:
- starting currency should cover a stable minimal opener
- wave payouts should enable one meaningful decision per early wave
- kill rewards should be smaller texture, not the whole income backbone
- pressure should usually require giving up or delaying a visible defensive improvement

## Out of scope for V0

Do not include:
- passive income trees
- interest banking layers
- economy sabotage
- multiple parallel resources
- elaborate upkeep systems
- worker/economy units
- debt/loan mechanics
- hidden catch-up rubberbanding
- marketplace or shop rotation economy
- pressure income conversion engines

## Future evolution

The economy can grow later if the MVP loop proves stable.

Possible extensions:
- limited package-specific economy modifiers
- timed pressure discounts or send windows
- small comeback pacing knobs for non-ranked modes
- advanced upgrade branches with clearer opportunity costs
- separate pressure resource only if shared currency makes pressure either too rare or too oppressive
- telemetry-driven tuning of kill rewards, wave payouts, and refunds

Expansion rule:
add one economy dimension at a time and test it against readability, pressure frequency, bot behavior, and replay determinism.

The MVP foundation should remain valid even if later versions add richer package identities or ranked balance knobs.

## Implementation implications

The first implementation should represent economy as deterministic state plus data-defined costs and rewards:
- currency balance per player slot
- starting currency in ruleset data
- tower build/upgrade costs in tower data
- sell/refund rule in ruleset or tower data
- enemy kill rewards in enemy data
- wave payouts in wave/ruleset data
- pressure costs in pressure pack data

All economy mutations must happen in simulation phases defined by `docs/SIMULATION_CONTRACT.md`.
UI may display and request spends, but it must not own authoritative economy changes.

## Related docs

- `docs/MVP_SCOPE_DECISIONS.md` — frozen MVP scope and pressure baseline
- `docs/SIMULATION_CONTRACT.md` — deterministic timing for spending, rewards, refunds, and payouts
- `docs/PRESSURE_MECHANIC_V0.md` — pressure send cost and delivery model
- `docs/DESIGN_FOUNDATION_LOADOUTS.md` — loadout/package relationship to economy and pressure
- `docs/CONTENT_PLAN_V0.md` — tower and enemy role framing
