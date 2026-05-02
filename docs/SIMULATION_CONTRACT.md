# Lil8TD Simulation Contract

## Purpose

This document is the first implementation anchor for the Lil8TD simulation layer.
It turns the planning docs into concrete rules that code and tests can target.

The contract exists to make the first foundation:
- deterministic enough for replay and future online 1v1
- small enough to implement locally before MultiWebCore integration
- explicit about tick order, command timing, entity identity, randomness, combat, leaks, economy, and pressure

If implementation needs to diverge from this contract, update this document and the deterministic smoke tests together.
Do not leave behavior implicit in rendering, UI callbacks, or network adapters.

## Contract baseline

### Fixed tick model

Use a fixed simulation tick of **20 Hz** for the first foundation.

Rules:
- one tick is `50 ms` of simulation time
- tick numbers are unsigned integer counters starting at `0`
- rendering may run at any frame rate, but rendering must not affect authoritative sim results
- all cooldowns, movement, spawn offsets, command application, and economy events are expressed in ticks
- no gameplay rule may depend on wall-clock time, animation frame delta, input callback timing, or browser scheduling jitter

Recommended initial API shape:

```text
step(state, commandsForTick) -> nextState
```

The step function should be pure from the caller perspective:
- input state + commands + pinned content + pinned ruleset = same output state
- no hidden reads from UI, system time, random globals, or mutable singleton content

### Match scope for first foundation

The first implementation target is local simulation first.

Required first-foundation mode:
- one board
- one player-side economy/life state
- one map
- scripted waves
- build/upgrade/sell
- tower combat
- leaks and terminal result
- baseline bot/autoplayer command generation for smoke tests

PvP mirrored dual-board semantics should be preserved in data shapes where cheap, but online/MWC runtime is not part of this contract's first implementation target.

## Canonical tick phases

Each simulation tick must run phases in this exact order:

1. **Begin tick bookkeeping**
   - increment or enter canonical `tick`
   - clear transient per-tick event buffers
   - verify state is not terminal before accepting active gameplay updates

2. **Command intake for this tick**
   - collect commands scheduled for the current tick
   - sort commands into canonical order
   - validate each command against the pre-command state plus already-applied commands in this tick
   - apply valid commands immediately in sorted order
   - record rejected commands with deterministic rejection reasons

3. **Wave spawn phase**
   - spawn enemies whose scheduled spawn tick equals the current tick
   - assign deterministic entity ids during spawn
   - insert spawned enemies into the lane in canonical spawn order

4. **Enemy movement phase**
   - advance all alive enemies along their path by fixed-tick movement rules
   - process path-end/leak detection after movement
   - mark leaked enemies for leak resolution; do not remove them yet if later phases need stable ordering

5. **Tower targeting phase**
   - process towers in ascending tower entity id order
   - each tower selects a target from the post-movement alive enemy set
   - targeting must use deterministic tie-breakers

6. **Tower attack/projectile emit phase**
   - update tower attack timers/cooldowns
   - towers that are ready emit attacks/projectiles against their selected targets
   - assign deterministic projectile ids if projectiles are represented as entities

7. **Projectile and hit resolution phase**
   - advance existing projectiles if projectile travel exists
   - resolve hits due on the current tick
   - apply damage/status effects in canonical event order
   - mark enemies at `hp <= 0` as killed; do not pay rewards until the economy phase

8. **Death and leak resolution phase**
   - remove killed enemies in ascending enemy id order
   - resolve leaked enemies in ascending enemy id order
   - apply life damage for leaks
   - record kill/leak events for economy and result checks

9. **Economy phase**
   - apply deterministic rewards/refunds/payouts caused by earlier phases
   - apply scheduled wave-clear or wave-start payouts if any are due this tick
   - pressure costs were already paid during command application and are not repeated here

10. **Pressure delivery scheduling phase**
    - convert accepted `pressure.send` commands into opponent-board spawn schedules or local test-board pressure schedules
    - never spawn pressure enemies in the same phase that accepted the command unless explicitly scheduled for the current tick by rule

11. **Result phase**
    - evaluate terminal conditions after deaths, leaks, and economy are settled
    - set result state once and make it immutable except for presentation metadata

12. **Hash/checkpoint phase**
    - optionally compute state hash/checkpoint after all state mutations for the tick
    - append replay events/checkpoints if running in recording mode

## Command intake and ordering

### Command timing

Commands are applied only on their scheduled canonical tick.

For local play:
- UI may request immediate actions
- the game layer must translate them into a command scheduled for a specific future or current tick
- tests should prefer explicit `tick -> commands[]` input

For future online play:
- commands should already fit a future-tick input model compatible with MultiWebCore
- MWC will own envelope timing and canonical commit delivery
- Lil8TD will still own semantic validation and application

### Canonical command sort order

Within the same tick, sort commands by:

1. `playerSlot` ascending (`0`, then `1` for future PvP)
2. command family priority
3. `clientCommandSeq` ascending
4. stable serialized command bytes as final tie-breaker if needed

Initial command family priority:

```text
loadout.pick     10  pre-start only
ready.confirm    20  pre-start only, if kept
tower.sell       30
tower.build      40
tower.upgrade    50
pressure.send    60
ability.cast     90  reserved, not implemented in first foundation
```

Rationale:
- sells happen before builds/upgrades so a player can free a tile or currency in one tick
- builds happen before upgrades so same-tick upgrade of a new tower is deterministic if allowed later
- pressure is paid after tower economy decisions for the tick
- abilities are reserved but out of scope for the first foundation

### Validation rules

Validation is stateful within the tick.
A command must be checked against the state after earlier same-tick valid commands have applied.

Common rejection categories should match `COMMAND_PROTOCOL_DRAFT.md`:
- `invalid_state`
- `unknown_command`
- `unknown_entity`
- `insufficient_resources`
- `illegal_position`
- `illegal_upgrade`
- `not_owner`
- `cooldown_active`
- `path_blocked`
- `loadout_restricted`

Rejected commands must not partially mutate state.
They may be recorded in replay/debug output as deterministic events.

### Application assumptions by command

#### `tower.build`

Apply immediately during command phase if valid:
- reserve/pay full build cost
- create tower entity id
- mark tile occupied
- initialize attack timer from tower definition
- tower may target/attack later in the same tick only if its definition explicitly allows `canActOnBuildTick`; default is **false**

#### `tower.upgrade`

Apply immediately during command phase if valid:
- pay upgrade cost
- update tower definition/level/path
- reset or preserve attack timer according to pinned tower definition
- default first-foundation rule: **preserve current attack timer, clamp to new max cooldown if needed**

#### `tower.sell`

Apply immediately during command phase if valid:
- remove tower from board
- free occupied tile
- schedule or apply refund deterministically in command phase
- first-foundation rule: **apply refund immediately during command phase**

#### `pressure.send`

Apply immediately for cost/cooldown validation:
- pay pressure cost during command phase
- record accepted pressure intent
- schedule delivery in pressure delivery scheduling phase

First-foundation default:
- pressure pack delivery tick = `acceptedTick + pressurePack.windupTicks`
- `windupTicks` must be data-defined and version-pinned
- minimum `windupTicks` is `1`; no zero-windup pressure for foundation tests

## Entity identity rules

Entity ids must be deterministic and never recycled within a match.

Recommended id shape:

```text
{kindPrefix}_{playerSlot}_{monotonicCounter}
```

Examples:
- `tw_0_1`
- `en_0_14`
- `pr_1_8`

Rules:
- keep separate counters per entity kind and player slot
- increment counters only when the entity is actually created
- do not derive ids from array index or rendering object identity
- removed entities keep their historical ids in replay events
- all iteration over entity collections must use canonical sorting, not insertion-order assumptions unless the insertion order itself is part of the contract

Canonical entity sort order:
- towers: ascending numeric tower counter
- enemies: ascending numeric enemy counter
- projectiles: ascending numeric projectile counter
- simultaneous events: by event tick, phase, actor id, target id, then event sequence

## Randomness and determinism policy

The first foundation should avoid randomness where practical.
If randomness is needed, it must be explicit and seeded.

Rules:
- no `Math.random()` or global random source in simulation code
- each match has a pinned `seed`
- use one deterministic PRNG implementation owned by `src/sim/` or equivalent
- PRNG state is part of authoritative simulation state when used
- data iteration order must be stable across runtimes
- avoid floating-point drift in authoritative state where possible

Preferred first-foundation representation:
- positions and path progress as fixed-point integers or rational tick units
- cooldowns as integer ticks
- speeds as `pathUnitsPerTick` or fixed-point units per tick
- ranges as integer tile/fixed-point distances

If floating point is used temporarily, deterministic tests must run in the target runtime and state hashes should avoid raw unstable presentation-only floats.

## Wave spawn timing semantics

Wave schedules are expressed in absolute or wave-relative ticks, never seconds.

Recommended wave data shape:

```text
waveIndex
startTick
groups[]:
  enemyType
  count
  firstOffsetTicks
  intervalTicks
  laneId
```

Spawn tick for item `i` in a group:

```text
startTick + firstOffsetTicks + i * intervalTicks
```

Rules:
- all groups for a wave are expanded into deterministic spawn events before or at match start
- if expansion is lazy, the lazy result must be byte-equivalent to eager expansion
- same-tick spawns are ordered by wave index, group index, item index, lane id, enemy type id
- wave-clear checks happen after death/leak resolution, not during spawn or movement
- wave rewards/payouts must specify whether they occur on wave start, wave clear, or fixed scheduled ticks

First-foundation default:
- use scripted wave progression
- do not use adaptive wave timing
- pressure spawns use the same spawn event mechanism with `source = pressure`

## Tower targeting and update semantics

Tower processing order is ascending tower id.

A tower can target only enemies that are:
- alive at the start of targeting phase
- not already marked leaked
- on a lane/path visible to that tower
- within deterministic range calculation

Default targeting policy for first foundation:

1. enemy with greatest path progress toward leak point
2. then lowest current hp
3. then lowest enemy id

Other targeting modes may be added later, but every mode must define full tie-breakers.

Attack cadence rules:
- cooldowns are integer tick counters
- default tower cannot fire on the same tick it was built
- when ready and target exists, tower emits one attack event and resets cooldown to its data-defined value
- if no target exists, cooldown behavior must be explicit; first-foundation default is to keep ready state rather than resetting

Frost/slow rule for first foundation:
- slow effects, if included, must be tick-duration based
- multiple slow effects need deterministic stacking rules before implementation
- simplest allowed foundation rule: strongest slow wins, duration refreshes only if new effect has equal or stronger magnitude

## Projectile, hit, death, and leak ordering

### Projectile model

The first foundation may use either instant-hit attacks or projectile entities.

If using instant-hit:
- hit events created in attack phase resolve in the same tick's hit resolution phase
- hits are ordered by attacker tower id, then target enemy id, then attack sequence

If using projectile entities:
- projectile creation happens in attack/projectile emit phase
- projectile movement happens in projectile/hit resolution phase on later ticks
- projectile ids are deterministic
- hit tick must be derived only from deterministic projectile rules

### Damage and death

Rules:
- damage events are applied in canonical hit event order
- enemies reduced to `hp <= 0` are marked killed immediately for later events in the same phase
- later hits in the same tick must ignore already-killed enemies unless a tower definition explicitly supports overkill/splash behavior
- kill rewards are paid once in economy phase

### Leaks

Rules:
- leaks are detected after enemy movement
- leaked enemies are marked leaked and become invalid targets immediately for targeting phase
- leak life damage is applied in death/leak resolution phase
- leaked enemies do not pay kill rewards
- if an enemy is both hit and reaches leak on the same tick, movement/leak status wins because movement occurs before targeting and hit resolution

### Death vs leak priority

Because movement happens before targeting and hit resolution:
- an enemy that reaches the leak point this tick leaks before towers can newly target it
- an enemy killed by already-existing projectile impact this tick can still be killed only if it was not marked leaked in movement phase

This is intentionally strict for readability and deterministic replay.
It may be revisited only with tests if gameplay feels unfair.

## Economy update timing

Economy has three kinds of changes:

1. command-phase spending/refunds
2. combat-phase rewards paid in economy phase
3. scheduled wave/pacing payouts paid in economy phase

Rules:
- build/upgrade/pressure costs are paid during command application
- sell refunds are paid during command application for first foundation
- kill rewards are paid during economy phase after deaths are finalized
- leak penalties affect lives, not currency, unless a future ruleset says otherwise
- wave-clear bonuses are paid in economy phase after clear detection
- no economy mutation may happen in render/UI code

Same-tick implication:
- currency earned from kills this tick is not available to commands earlier in the same tick
- currency from a same-tick sell is available to later same-tick commands because sell is a command-phase mutation

## Pressure command timing rules

First pressure mechanic:
- spend a defined resource/currency to send an additional enemy pack

Rules:
- pressure packs are data-defined and version-pinned
- command validation checks cost, current state, pack id, sender ownership, and rate limits/cooldowns
- accepted pressure commands pay immediately during command phase
- delivery is scheduled after command phase, using `acceptedTick + windupTicks`
- delivery creates spawn events using normal wave spawn ordering with `source = pressure`
- pressure must never mutate opponent state directly except through scheduled spawn events

Local foundation interpretation:
- pressure can be tested against a local mirrored/opponent board model later
- before dual-board exists, pressure scheduling can be smoke-tested by asserting generated spawn events without requiring online play

Out of first foundation:
- multiple pressure types
- temporary tower debuffs
- economy stress attacks
- lane events
- pressure counterplay abilities

## Replay and serialization assumptions

Replay is a first-class test tool, not a later luxury.

A minimal replay record should contain:
- game version
- content version
- ruleset version
- map version
- simulation contract version or document revision marker
- match seed
- player slots/loadouts
- initial state or deterministic setup descriptor
- canonical command stream by tick
- optional state hash checkpoints
- terminal result summary

Serialization rules:
- use canonical JSON or another stable byte format for replay files and hash inputs
- object keys must be serialized in stable order
- arrays must already be in canonical order
- do not serialize UI-only, render-only, audio-only, or debug-only state into authoritative snapshots
- migrations are allowed between versions, but a replay should always declare the version it was produced under

Replay test expectation:
- running the same replay twice in the same supported runtime must produce the same terminal result and same checkpoint hashes

## State hash and verification guidance

State hashes are recommended early, even before networking.

Hash checkpoints should be computed after the full tick completes.

Initial checkpoint cadence:
- every `20` ticks for smoke tests
- every tick for small unit tests where useful
- final terminal hash always recorded

Hash should include authoritative state only:
- tick
- player economy/lives/result
- map/path identifiers and version pins
- entity ids and authoritative components
- wave/pressure spawn queues
- active statuses/cooldowns
- PRNG state if used

Hash should exclude:
- screen position interpolation
- animation timers that do not affect gameplay
- particles/VFX/audio
- UI hover/selection state
- logs, localized strings, and transient debug messages

When a deterministic mismatch occurs, tests should report:
- first mismatching tick
- expected hash
- actual hash
- recent command window
- recent sim event window

## Explicitly out of scope for first foundation

Do not implement or design around these as required first-foundation features:

- online multiplayer runtime
- MultiWebCore room/reconnect wiring
- rollback netcode
- peer-to-peer play
- active abilities
- multiple pressure mechanics
- shared-map PvP
- broad content roster
- multiple maps
- procedural map generation
- spectator mode
- cosmetics/progression/live-service systems
- generalized modding
- complex status-effect stacking beyond the Frost foundation rule
- adaptive AI director wave generation
- mobile optimization as a primary constraint

The first foundation should prove one clean local loop with deterministic replay.
Everything else should build on that proof, not compete with it.

## Related docs

- `docs/MVP_SCOPE_DECISIONS.md` — frozen MVP guardrails
- `docs/FIRST_IMPLEMENTATION_MILESTONE.md` — local playable foundation target
- `docs/TECH_SPEC_V0.md` — broader technical direction
- `docs/COMMAND_PROTOCOL_DRAFT.md` — game command payload semantics
- `docs/MWC_INTEGRATION_PLAN.md` — later online integration boundary
