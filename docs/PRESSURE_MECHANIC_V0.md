# Lil8TD Pressure Mechanic V0

## Purpose

This document fixes the first pressure-system design anchor for Lil8TD before coding.
It narrows PvP interaction to one readable mechanic that can be implemented, tested, and balanced against the deterministic simulation contract.

Pressure exists to make mirrored dual-board PvP feel interactive without turning Lil8TD into direct RTS control or opaque spell spam.
A player should be able to stress the opponent's board through timing and economy choices, while the opponent still sees the threat, understands why it happened, and has room to respond.

## Why one pressure mechanic first

MVP starts with **one pressure mechanic** because the project first needs to prove:
- pressure is readable on a separate board
- pressure timing creates tension without chaos
- pressure spending competes with defense and economy
- bots can use and answer pressure in simple ways
- replays and online command flow can represent pressure cleanly

Multiple pressure tricks would multiply balance risk before the base loop is known.
Debuffs, sabotage, lane events, and spell-like pressure trees can come later only if the basic send mechanic is fun and understandable.

## V0 mechanic

V0 pressure mechanic: **send additional enemy pack**.

The player spends a defined resource/currency to schedule an extra pack of enemies on the opponent's board.
The pack does not directly damage towers, steal economy, disable controls, or mutate opponent state except by adding normal spawn events.

This keeps pressure inside the existing TD language:
- enemies spawn
- towers target them
- leaks punish failed defense
- timing and composition matter

## Design goals

Pressure V0 should be:

1. **Readable**
   - The opponent can see incoming pressure before it arrives.
   - Pressure enemies are visually distinguishable enough to explain the event, but still use normal enemy rules.

2. **Timing-based**
   - Good sends exploit weak moments, wave overlaps, greedy economy, or visible layout gaps.
   - Bad sends should feel wasteful, not automatically useful.

3. **Counterplay-friendly**
   - The opponent should have a windup window to build, upgrade, sell/reposition if allowed, or accept a calculated leak risk.
   - Counterplay should come from normal TD decisions first, not special anti-pressure buttons.

4. **Useful without being mandatory every tick**
   - Pressure should be a meaningful option, not an always-click tax.
   - Holding resources for defense, upgrades, or economy must remain valid.

5. **Economically meaningful**
   - Sending pressure must cost something the sender cares about.
   - Failed or poorly timed pressure should leave the sender behind in defense/economy tempo.

## Exact V0 structure

### What the player sends

A `pressure.send` command chooses one data-defined `pressurePackId`.

Recommended first pack set for testing should be tiny, for example:
- one baseline small pack using existing Grunt-like enemies
- one fast-light pack using Runner-like enemies, if V0 needs a speed contrast
- one heavy-light pack using Brute-like enemies, if V0 needs an armor/HP contrast

However, the first playable balance pass may start with only one pack.
Do not add many pack variants before send timing, UI warning, and economy tradeoff are proven.

### Cost/resource logic

V0 should use a simple, explicit cost model:
- pressure is paid during command application
- cost is version-pinned in content/ruleset data
- cost can be normal currency or a separate pressure resource, but not both initially

Recommended V0 default: **normal currency cost**.

Reason:
- easiest to understand
- directly competes with towers/upgrades
- naturally prevents free spam
- fits the current command/economy contract

A separate pressure resource can be considered later if normal-currency pressure makes players too passive or creates balance knots.

### Windup/delay requirement

Every accepted send has a required windup.

Rules:
- no zero-windup pressure
- `windupTicks` is data-defined and version-pinned
- delivery tick = `acceptedTick + windupTicks`
- minimum foundation rule remains `windupTicks >= 1`
- practical PvP tuning should use a visible delay long enough for reaction, not merely one tick

The windup is part of the mechanic, not UI polish. It is what turns pressure from surprise punishment into timing play.

### Delivery semantics

At delivery, the pack becomes scheduled spawn events on the opponent board using the normal wave spawn system.

Rules:
- pressure enemies use normal enemy movement, targeting, damage, death, reward/leak rules unless a pack explicitly overrides a pinned value
- spawn events carry `source = pressure`
- same-tick ordering follows the simulation contract's spawn ordering rules
- pressure does not directly alter opponent currency, towers, cooldowns, map, or controls

### Interaction with normal waves

Pressure can overlap normal waves.
That overlap is the main source of PvP tension.

Rules:
- pressure spawns do not pause, replace, or reorder normal wave spawns
- pressure and wave enemies coexist in the same lane/path rules
- pressure should be tuned around moderate overlap, not screen-filling chaos
- pressure packs should be small enough that the current wave remains readable

If pressure overlap makes the board visually muddy, reduce pack size/spacing before adding special mechanics.

### Opponent visibility

The opponent should know:
- that a pressure send was accepted
- who sent it, in PvP presentation
- approximate or exact arrival timing
- pack identity/category, at least enough to make a defensive decision
- when pressure enemies actually enter the board

Recommended V0 UI:
- incoming pressure indicator during windup
- arrival countdown or timeline marker
- simple pack label/icon
- source marker on spawned enemies or wave list

No hidden pressure for V0.

## Intended gameplay use cases

### Punish greed

If the opponent spends too much on economy or delays core defense, a timed send can force leaks or emergency inefficient builds.

### Exploit visible weakness

If the opponent's board is weak against fast enemies, clustered enemies, or high-HP enemies, the sender can choose a pack/timing that stresses that gap.

For the earliest V0 with only one pack, this still works as lane/timing exploitation rather than composition exploitation.

### Create timing stress before a difficult wave

A send shortly before a known hard wave can force the opponent to upgrade earlier than planned or enter the wave with poor currency timing.

This is the cleanest PvP drama target: pressure changes the opponent's preparation window without becoming a direct attack spell.

### Force inefficient defense without lethal damage

A good send does not need to kill.
It can still win value by forcing:
- early upgrades
- awkward tower placement
- lower economy reserve
- missed greedy timing
- defensive overreaction

This is important for keeping pressure relevant while avoiding all-or-nothing burst kills.

## Anti-abuse guardrails

- **No zero-windup burst nonsense**
  - Every send must have delay and visible warning.

- **No opaque hidden pressure**
  - The opponent must see enough to understand and respond.

- **No unbounded spam loops**
  - Use cost, cooldown/rate limit, pack availability, or send queue limits.
  - Do not allow pressure rewards to directly fund more pressure in a runaway loop.

- **Pressure competes with own defense/economy**
  - Sending must consume resources that could have improved the sender's board.
  - Pressure Forge-style advantages, if any, must be moderate.

- **Package differences stay moderate**
  - Loadout pressure bonuses should be small timing/cost/access differences, not huge hidden multipliers.
  - Do not stack several pressure advantages on one package in MVP.

- **Moderate pack differences**
  - Pack variants should differ by clear role, not extreme stat spikes.
  - Avoid packs that require a single exact counter or instantly punish normal openings.

- **No unreadable overlap**
  - If pressure plus wave clutter becomes unclear, reduce count/spacing/intensity before adding UI complexity.

## Explicitly out of scope for V0

Do not include these in V0:
- temporary tower debuffs
- economy sabotage
- map manipulation
- direct tower disable
- forced tower sell/lock effects
- hidden pressure events
- complex spell-like pressure trees
- lane rerouting or path mutation
- multiple pressure resource systems
- pressure counterspell abilities
- broad pack roster with hard-counter composition rules

V0 should prove one clear send loop, not become a second game layered on top of TD.

## Future evolution

If V0 works, pressure can grow carefully in later versions.

Possible extensions:
- more pack types with clear roles: swarm, fast, heavy, shielded-light
- package-specific pressure modifiers, one per package max at first
- limited send windows tied to wave cadence
- pressure queue preview and timeline UX
- bot personalities around pressure timing
- ranked/online telemetry for send timing, leak impact, and overuse
- later non-pack mechanics, such as mild lane events or temporary modifiers, only after pack pressure is proven readable

Expansion rule:
Add one pressure dimension at a time, then test it against readability, counterplay, and economy tradeoff.

## Implementation implications

The first implementation should treat pressure as data plus command scheduling:
- `pressure.send` validates pack id, cost, state, and rate limit
- accepted command pays cost immediately
- accepted command records an intent/event
- delivery scheduling creates normal spawn events at `acceptedTick + windupTicks`
- spawned enemies use `source = pressure`
- replay records include pressure commands and generated spawn events deterministically

The simulation should not special-case pressure as direct opponent damage.
Pressure is extra enemies through the same authoritative spawn/combat/leak pipeline.

## Related docs

- `docs/MVP_SCOPE_DECISIONS.md` — locks one pressure mechanic for MVP
- `docs/SIMULATION_CONTRACT.md` — command timing and pressure delivery scheduling rules
- `docs/DESIGN_FOUNDATION_LOADOUTS.md` — package relationship to pressure
- `docs/COMMAND_PROTOCOL_DRAFT.md` — `pressure.send` command shape
