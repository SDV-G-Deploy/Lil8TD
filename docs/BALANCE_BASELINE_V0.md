# Lil8TD Balance Baseline V0

## Purpose

This document gives Lil8TD a first **relative numeric seed** for the first playable / simulation pass.
It bridges the design foundation docs into values that can be placed into ruleset data, smoke tests, bots, and early playtests.

This is **not final balance truth**.
It is a provisional baseline so the local deterministic sim has something coherent to run while the team learns what actually breaks.

## Baseline assumptions

Use these numbers as starting ratios, not promises:

- `1.0x` cost = cheap early tower reference.
- First playable may start with only **Arrow / Burst / Frost** and **Grunt / Runner / Brute**.
- The expanded V0 table keeps the first 6 tower/enemy roles aligned with `CONTENT_PLAN_V0.md`.
- One main currency pays for towers, upgrades, and pressure, per `ECONOMY_MODEL_V0.md`.
- Fixed tick sim and command timing follow `SIMULATION_CONTRACT.md`.

Optional concrete seed for testing:

```text
cheap tower reference = 50 credits
starting currency = 140-170 credits
basic pressure pack = 45-70 credits
sell refund = 65% of refundable value
```

If concrete credits feel noisy, keep only the relative `x` ratios in design discussions.

## Tower baseline V0

| Tower | Cost tier | Damage style | Attack speed feel | Range feel | Purpose |
|---|---:|---|---|---|---|
| Arrow Tower | `1.0x` | single-target, clean physical hit | medium-fast | medium | baseline early defender, filler coverage, balance reference |
| Burst Tower | `1.8-2.2x` | small splash / clustered light clear | slow-medium | short-medium | anti-swarm cleanup, punishes clumps, weak as only anti-heavy plan |
| Piercer Tower | `2.2-2.8x` | sustained anti-heavy / lane pierce | slow | medium-long lane value | answers Brutes and high-HP pressure without deleting swarms |
| Frost Tower | `2.0-2.6x` | low damage + slow | slow | medium | control tool, extends kill zones, not a solo damage solution |
| Support Beacon | `2.5-3.2x` | no/low direct damage; aura efficiency | passive / periodic | small aura | layout investment, boosts committed positions, bad as panic spend |
| High-Cost Spike Tower | `4.5-6.0x` | high single-target or focused burst | slow but impactful | medium-long | anchor stabilizer, expensive commitment, should not solve every enemy type alone |

### First implementation subset

For the smallest playable, start with:

1. **Arrow** as the universal reference.
2. **Burst** as anti-swarm contrast.
3. **Frost** as control/support contrast.

Add **Piercer** before Brute-heavy waves become central. Add **Support Beacon** and **High-Cost Spike** only after tower build/upgrade/sell decisions are readable.

## Enemy baseline V0

| Enemy | HP feel | Speed feel | Reward feel | Threat feel | Purpose |
|---|---|---|---|---|---|
| Grunt | baseline `1.0x` | baseline | baseline reward | readable normal pressure | wave readability anchor; tests basic DPS |
| Runner | `0.55-0.75x` | fast | low | leak threat | tests placement gaps, range coverage, and slow value |
| Brute | `2.5-3.5x` | slow | medium-high | sustained pressure | tests anti-heavy planning and upgrade commitment |
| Swarmling | `0.25-0.4x` | medium-fast | tiny each, fair as group | body-count pressure | punishes pure single-target overinvestment |
| Shielded Unit | `1.2-1.6x effective` | medium-slow | medium | composition check | asks for mixed damage/positioning without becoming a hard counter |
| Sprinter | `0.8-1.1x` | burst-fast | medium-low | surprise leak spike | tests lane coverage during overlaps and pressure windows |

### First implementation subset

For the smallest playable, start with:

1. **Grunt** for baseline tuning.
2. **Runner** for speed/readability tuning.
3. **Brute** for HP/upgrade tuning.

Add **Swarmling** once Burst needs a clear job. Add Shielded/Sprinter only after the basic roster is stable enough that differences are visible, not just numeric noise.

## Wave progression baseline

Do not tune wave-by-wave too early. Use phases first.

### Early phase: teach stable defense

Goal: confirm Arrow + one sensible placement can survive, but not perfectly forever.

Shape:
- mostly Grunts
- small Runner appearances after the player has one normal defense decision
- payouts allow one meaningful build or upgrade choice per wave
- pressure disabled or very limited in pure local smoke tests

Validation question: does the board explain why enemies leak?

### Mid phase: force role choice

Goal: make tower roles matter.

Shape:
- Grunt + Runner mixes
- first Brute wave asks for anti-heavy or upgrade commitment
- first Swarmling-like group, if available, asks for Burst value
- Frost should help, but not replace damage

Validation question: can different reasonable openings stabilize in different ways?

### Pressure-test phase: overlap without chaos

Goal: test `pressure.send` as a timing decision.

Shape:
- normal wave is moderately hard but not lethal alone
- one basic pressure pack can overlap the wave after visible windup
- pressure should force a response, not auto-collapse a normal board

Validation question: does pressure create tension while staying readable?

### Escalation phase: expose weak plans

Goal: reveal whether a tower/enemy role has become universal or irrelevant.

Shape:
- mixed Runner/Grunt/Brute compositions
- occasional swarm group if Burst exists
- tighter payout windows
- pressure sends become more expensive to mistime

Validation question: are failures caused by understandable strategic gaps rather than hidden math spikes?

## Pressure pack baseline V0

Start with **one pack**:

```text
packId: basic_grunt_pressure
composition: 4-6 Grunt-equivalent enemies
spacing: loose enough to remain readable
windup: visible, not instant; practical test target 4-8 seconds equivalent
cost: 0.9-1.3x cheap tower reference
reward: normal or slightly reduced kill rewards; never enough to fund repeat pressure by itself
```

Expected use:
- punish greed
- force an earlier build/upgrade
- overlap a known awkward wave
- create opponent stress without direct sabotage

Do **not** add fast/heavy pressure packs until the basic pack proves:
- players notice it before arrival
- bots can send/respond simply
- failed pressure clearly costs the sender tempo
- pressure does not become an always-click tax

## Economy links

### Tower cost relations

Use `ECONOMY_MODEL_V0.md` tiers directly:

- cheap/core boundary: Arrow at `1.0x`; Burst/Piercer around `2.0x`.
- support/control: Frost and Beacon cost more than cheap damage because their value scales with layout.
- anchor: Spike Tower costs `4.5-6.0x`; buying it should delay pressure and coverage.

### Upgrade relations

Seed upgrades as:

- first upgrade: `1.0-1.6x` tower build cost
- second/anchor upgrade later: `1.8-2.5x` tower build cost
- early upgrade should improve efficiency, not replace map coverage

### Pressure versus defense pricing

Basic pressure should cost about:

- one cheap tower, or
- a first small upgrade, or
- the difference between stabilizing now and saving for a core tower

If pressure is cheaper than the emergency answer it forces, it risks becoming mandatory spam.
If pressure is much more expensive than a core defensive step, it may never be sent.

### Refund intuition

Start sell refund around **65%**.

Use refunds to allow recovery from bad placement or emergency pressure response, not perfect free repositioning.
Upgrade refunds, if implemented, should be explicit and probably less generous than base build refunds.

## Balance guardrails

- No universal best tower: every tower must have at least one normal situation where another tower is the better spend.
- Enemy roster must not be purely numeric: each enemy should ask a different layout, targeting, or timing question.
- No auto-win pressure: a pressure send should create stress and inefficiency, not deterministic collapse against a normal board.
- Avoid binary counters: Brutes should prefer Piercer/upgrade value, not require exactly one tower; Runners should reward Frost/range, not invalidate all else.
- Keep package differences moderate: Pressure Forge may get one small pressure edge later, not stacked cost + timing + power bonuses.
- Do not tune around perfect play; first playable must survive normal mistakes.
- Prefer reducing clutter/counts before adding special rules if waves become unreadable.

## What to validate first in simulation/playtests

1. **Arrow reference:** can it define the basic DPS/cost line without becoming best at everything?
2. **Enemy readability:** can players tell Runner leaks from Grunt leaks from Brute leaks by watching the board?
3. **First-choice economy:** does each early wave create one meaningful spend decision?
4. **Upgrade vs coverage:** are early upgrades useful but not always better than a second tower?
5. **Frost value:** does slow create visible kill-zone value without becoming mandatory?
6. **Pressure timing:** does basic pressure feel like a risk/reward spend instead of a button tax?
7. **Recovery:** can a player survive one bad choice through selling/rebuilding without full reset or free abuse?
8. **Bot baseline:** can a simple scripted bot clear early/mid waves and occasionally send pressure without cheating?
9. **Deterministic replay:** same ruleset + commands must produce same leaks, kills, currency, and result.

## Related docs

- `docs/MVP_SCOPE_DECISIONS.md` — MVP scope and mirrored dual-board PvP choice
- `docs/SIMULATION_CONTRACT.md` — deterministic tick, command, economy, and pressure timing
- `docs/DESIGN_FOUNDATION_LOADOUTS.md` — package/loadout archetypes
- `docs/PRESSURE_MECHANIC_V0.md` — pressure send design anchor
- `docs/ECONOMY_MODEL_V0.md` — single-currency economy and cost ratios
- `docs/CONTENT_PLAN_V0.md` — tower/enemy roster framing
